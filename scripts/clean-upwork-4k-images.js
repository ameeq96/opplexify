#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { spawn, spawnSync } = require("node:child_process");
const sharp = require("sharp");

process.stdout.on("error", (error) => {
  if (error.code === "EPIPE") {
    process.exit(0);
  }

  throw error;
});

const REPO_ROOT = path.resolve(__dirname, "..");
const INPUT_DIR = path.join(
  REPO_ROOT,
  "apps/web/public/portfolio/upwork-4k"
);
const OUTPUT_DIR = path.join(INPUT_DIR, "cleaned-4k");
const TARGET_LONG_EDGE = 3840;
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const FORCE = process.argv.includes("--force");
const AI_MODE = process.argv.includes("--ai");
const AI_TIMEOUT_MS =
  Number.parseInt(process.env.IMAGE_CLEAN_AI_TIMEOUT_MS || "0", 10) || 0;
const CONCURRENCY = Math.max(
  1,
  Number.parseInt(
    process.env.IMAGE_CLEAN_CONCURRENCY || (AI_MODE ? "1" : "2"),
    10
  ) || (AI_MODE ? 1 : 2)
);

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio || "ignore",
      ...options
    });
    let timeout;

    if (options.timeoutMs) {
      timeout = setTimeout(() => {
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 5000).unref();
        reject(new Error(`${command} timed out after ${options.timeoutMs}ms`));
      }, options.timeoutMs);
      timeout.unref();
    }

    child.on("error", reject);
    child.on("close", (code) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function commandExists(command) {
  const result = spawnSync("which", [command], {
    encoding: "utf8"
  });

  return result.status === 0;
}

function firstExistingPath(paths) {
  for (const candidate of paths.filter(Boolean)) {
    try {
      require("node:fs").accessSync(candidate);
      return candidate;
    } catch {
      // Keep looking.
    }
  }

  return null;
}

function detectTools() {
  const siblingUpscaylRoot = path.resolve(
    REPO_ROOT,
    "../opplexifyl/node_modules/upscayl-node/dist/upscaler/sub-classes"
  );
  const upscaylBin = firstExistingPath([
    process.env.UPSCAYL_BIN,
    commandExists("upscayl-bin") ? "upscayl-bin" : null,
    commandExists("upscayl") ? "upscayl" : null,
    path.join(
      siblingUpscaylRoot,
      "driver/command-upscayl/resources/linux/bin/upscayl-bin"
    )
  ]);
  const upscaylModelDir = firstExistingPath([
    process.env.UPSCAYL_MODEL_DIR,
    path.join(siblingUpscaylRoot, "model-manager/models")
  ]);

  return {
    sharp: true,
    imageMagick: commandExists("magick") || commandExists("convert"),
    pillow: spawnSync("python3", [
      "-c",
      "import PIL; print(PIL.__version__)"
    ], { encoding: "utf8" }).status === 0,
    opencv: spawnSync("python3", [
      "-c",
      "import cv2; print(cv2.__version__)"
    ], { encoding: "utf8" }).status === 0,
    realEsrganNcnn: commandExists("realesrgan-ncnn-vulkan"),
    realEsrgan: commandExists("real-esrgan"),
    upscayl: commandExists("upscayl"),
    upscaylBin,
    upscaylModelDir
  };
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function walkImages(directory, output = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (path.resolve(fullPath) === OUTPUT_DIR) {
        continue;
      }

      await walkImages(fullPath, output);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      continue;
    }

    if (isInside(OUTPUT_DIR, path.resolve(fullPath))) {
      continue;
    }

    output.push(fullPath);
  }

  return output;
}

function outputPathFor(inputPath) {
  const relative = path.relative(INPUT_DIR, inputPath);
  const parsed = path.parse(relative);
  return path.join(OUTPUT_DIR, parsed.dir, `${parsed.name}-4k.png`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function targetSize(width, height) {
  if (!width || !height) {
    throw new Error("Image metadata is missing width or height");
  }

  if (width >= height) {
    return {
      width: TARGET_LONG_EDGE,
      height: Math.round((height / width) * TARGET_LONG_EDGE)
    };
  }

  return {
    width: Math.round((width / height) * TARGET_LONG_EDGE),
    height: TARGET_LONG_EDGE
  };
}

async function processWithSharp(inputPath, outputPath) {
  const metadata = await sharp(inputPath, { limitInputPixels: false }).metadata();
  const dimensions = targetSize(metadata.width, metadata.height);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(inputPath, { limitInputPixels: false })
    .rotate()
    .resize({
      ...dimensions,
      fit: "inside",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false
    })
    .toColorspace("srgb")
    .linear(1.025, -3)
    .sharpen({
      sigma: 0.85,
      m1: 0.35,
      m2: 0.8,
      x1: 2,
      y2: 8,
      y3: 16
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: false
    })
    .toFile(outputPath);

  return dimensions;
}

async function processWithRealesrgan(inputPath, outputPath) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upwork-4k-"));
  const tempOutput = path.join(tempDir, "upscaled.png");

  try {
    await runCommand("realesrgan-ncnn-vulkan", [
      "-i",
      inputPath,
      "-o",
      tempOutput,
      "-s",
      "4",
      "-n",
      "realesrgan-x4plus"
    ]);

    return await processWithSharp(tempOutput, outputPath);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function processWithUpscayl(inputPath, outputPath, tools) {
  const metadata = await sharp(inputPath, { limitInputPixels: false }).metadata();
  const dimensions = targetSize(metadata.width, metadata.height);
  const aiInputDimensions = {
    width: Math.max(1, Math.round(dimensions.width / 4)),
    height: Math.max(1, Math.round(dimensions.height / 4))
  };
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upwork-upscayl-"));
  const tempInput = path.join(tempDir, "ai-input.png");
  const tempOutput = path.join(tempDir, "upscaled.png");

  try {
    await sharp(inputPath, { limitInputPixels: false })
      .rotate()
      .resize({
        ...aiInputDimensions,
        fit: "inside",
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: false
      })
      .toColorspace("srgb")
      .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
      .toFile(tempInput);

    const args = [
      "-i",
      tempInput,
      "-o",
      tempOutput,
      "-m",
      tools.upscaylModelDir,
      "-n",
      process.env.UPSCAYL_MODEL || "realesrgan-x4plus",
      "-s",
      "4",
      "-f",
      "png",
      "-t",
      process.env.UPSCAYL_TILE_SIZE || "64"
    ];

    await runCommand(tools.upscaylBin, args, {
      timeoutMs: AI_TIMEOUT_MS,
      env: {
        ...process.env,
        __NV_PRIME_RENDER_OFFLOAD:
          process.env.__NV_PRIME_RENDER_OFFLOAD || "1",
        __VK_LAYER_NV_optimus: process.env.__VK_LAYER_NV_optimus || "NVIDIA_only"
      }
    });

    return await processWithSharp(tempOutput, outputPath);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function processOne(inputPath, tools) {
  const outputPath = outputPathFor(inputPath);
  const relativeInput = path.relative(INPUT_DIR, inputPath);
  const relativeOutput = path.relative(INPUT_DIR, outputPath);

  if (!FORCE && await fileExists(outputPath)) {
    return {
      status: "skipped",
      inputPath,
      outputPath,
      reason: "output already exists"
    };
  }

  try {
    let dimensions;

    if (AI_MODE && tools.upscaylBin && tools.upscaylModelDir) {
      dimensions = await processWithUpscayl(inputPath, outputPath, tools);
    } else if (AI_MODE && tools.realEsrganNcnn) {
      dimensions = await processWithRealesrgan(inputPath, outputPath);
    } else {
      dimensions = await processWithSharp(inputPath, outputPath);
    }

    return {
      status: "processed",
      inputPath,
      outputPath,
      message: `${relativeInput} -> ${relativeOutput} (${dimensions.width}x${dimensions.height})`
    };
  } catch (error) {
    return {
      status: "skipped",
      inputPath,
      outputPath,
      reason: error.message || String(error)
    };
  }
}

async function runLimited(items, limit, worker) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => next()
  );

  await Promise.all(workers);
  return results;
}

function printToolSummary(tools) {
  console.log("Tool check:");
  console.log(`- sharp: available`);
  console.log(`- ImageMagick/magick: ${tools.imageMagick ? "available" : "not found"}`);
  console.log(`- Python Pillow/PIL: ${tools.pillow ? "available" : "not found"}`);
  console.log(`- Python OpenCV/cv2: ${tools.opencv ? "available" : "not found"}`);
  console.log(`- realesrgan-ncnn-vulkan: ${tools.realEsrganNcnn ? "available" : "not found"}`);
  console.log(`- real-esrgan: ${tools.realEsrgan ? "available" : "not found"}`);
  console.log(`- upscayl: ${tools.upscayl ? "available" : "not found"}`);
  console.log(`- upscayl-bin: ${tools.upscaylBin ? tools.upscaylBin : "not found"}`);
  console.log(`- upscayl models: ${tools.upscaylModelDir ? tools.upscaylModelDir : "not found"}`);

  if (AI_MODE && tools.upscaylBin && tools.upscaylModelDir) {
    console.log("Pipeline: Sharp pre-scale to 1/4 target + Upscayl Real-ESRGAN x4 + Sharp final 3840px PNG pass.");
  } else if (AI_MODE && tools.realEsrganNcnn) {
    console.log("Pipeline: realesrgan-ncnn-vulkan AI pass + Sharp final 3840px PNG pass.");
  } else {
    console.log("Pipeline: Sharp fallback, Lanczos resize + conservative clarity/contrast + PNG output.");
  }

  if (!AI_MODE && (tools.upscaylBin || tools.realEsrganNcnn)) {
    console.log("AI mode is available but not enabled. Use --ai when you want the slower AI pass.");
  }

  if (AI_MODE && !tools.upscaylBin && !tools.realEsrganNcnn) {
    console.log("AI mode requested, but no supported local AI CLI was found. Falling back to Sharp.");
  }
}

async function main() {
  const tools = detectTools();
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  printToolSummary(tools);
  console.log("");
  console.log(`Input folder: ${INPUT_DIR}`);
  console.log(`Output folder: ${OUTPUT_DIR}`);
  console.log(`Target long edge: ${TARGET_LONG_EDGE}px`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Overwrite existing outputs: ${FORCE ? "yes" : "no"}`);
  console.log(`AI mode: ${AI_MODE ? "yes" : "no"}`);
  if (AI_TIMEOUT_MS) {
    console.log(`AI timeout per file: ${AI_TIMEOUT_MS}ms`);
  }
  if (AI_MODE) {
    console.log(`AI model: ${process.env.UPSCAYL_MODEL || "realesrgan-x4plus"}`);
    console.log(`AI tile size: ${process.env.UPSCAYL_TILE_SIZE || "64"}`);
  }
  console.log("");

  const images = (await walkImages(INPUT_DIR)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const results = await runLimited(images, CONCURRENCY, async (imagePath) => {
    const result = await processOne(imagePath, tools);
    const relative = path.relative(INPUT_DIR, imagePath);

    if (result.status === "processed") {
      console.log(`processed: ${result.message}`);
    } else {
      console.log(`skipped: ${relative} (${result.reason})`);
    }

    return result;
  });

  const processed = results.filter((result) => result.status === "processed");
  const skipped = results.filter((result) => result.status === "skipped");

  console.log("");
  console.log("Summary:");
  console.log(`- total images found: ${images.length}`);
  console.log(`- total images processed: ${processed.length}`);
  console.log(`- skipped files: ${skipped.length}`);
  if (skipped.length > 0) {
    for (const item of skipped) {
      console.log(`  - ${path.relative(INPUT_DIR, item.inputPath)}: ${item.reason}`);
    }
  }
  console.log(`- output folder path: ${OUTPUT_DIR}`);
  console.log("");
  console.log("Run this task again with:");
  console.log("  node scripts/clean-upwork-4k-images.js");
  console.log("");
  console.log("To regenerate existing outputs:");
  console.log("  node scripts/clean-upwork-4k-images.js --force");
  console.log("");
  console.log("To try local AI upscaling when a usable GPU/AI CLI is available:");
  console.log("  node scripts/clean-upwork-4k-images.js --force --ai");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
