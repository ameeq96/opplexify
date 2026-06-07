const { mkdir, readdir, stat } = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const inputDir = path.resolve(__dirname, "../apps/web/public/portfolio/images");
const outputDir = path.resolve(__dirname, "../apps/web/public/portfolio/thumbs");
const imageExtensions = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function main() {
  const files = (await readdir(inputDir))
    .filter((name) => imageExtensions.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  await mkdir(outputDir, { recursive: true });

  let totalSize = 0;

  for (const [index, file] of files.entries()) {
    const filename = `portfolio-${String(index + 1).padStart(3, "0")}.webp`;
    const outputPath = path.join(outputDir, filename);

    await sharp(path.join(inputDir, file), { limitInputPixels: false })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(outputPath);

    const { size } = await stat(outputPath);
    totalSize += size;

    if ((index + 1) % 10 === 0 || index === files.length - 1) {
      console.log(`Generated ${index + 1}/${files.length} thumbnails`);
    }
  }

  console.log(`Portfolio thumbnails ready: ${files.length} files, ${formatBytes(totalSize)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
