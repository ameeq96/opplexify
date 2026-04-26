import Image from "next/image";
import type { PortfolioProject } from "@/lib/data";

type ProjectPreviewProps = {
  project: Pick<PortfolioProject, "title" | "image">;
  large?: boolean;
};

export function ProjectPreview({ project, large = false }: ProjectPreviewProps) {
  const isVideo = project.image.toLowerCase().endsWith(".mp4");

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-[var(--line)] bg-white dark:bg-ink ${
        large ? "aspect-[4/3] shadow-glow" : "aspect-[4/3]"
      }`}
      aria-label={`${project.title} interface preview`}
      role="img"
    >
      {isVideo ? (
        <video
          src={project.image}
          className="absolute inset-0 h-full w-full bg-ink object-contain"
          autoPlay={!large}
          controls={large}
          loop
          muted
          playsInline
        />
      ) : (
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes={large ? "(min-width: 1024px) 760px, 100vw" : "(min-width: 1024px) 420px, 100vw"}
          className="bg-white object-contain dark:bg-ink"
        />
      )}
    </div>
  );
}
