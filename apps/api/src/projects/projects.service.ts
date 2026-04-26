import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const projects = await this.prisma.portfolioProject.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return projects.sort((first, second) => {
      const firstVideo = first.category === "Video Showcase";
      const secondVideo = second.category === "Video Showcase";

      if (firstVideo && secondVideo) {
        return first.title.localeCompare(second.title, undefined, { numeric: true });
      }

      if (firstVideo) {
        return -1;
      }

      if (secondVideo) {
        return 1;
      }

      return 0;
    });
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.portfolioProject.findUnique({
      where: {
        slug
      }
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prisma.portfolioProject.create({
      data: {
        ...dto,
        liveUrl: dto.liveUrl ?? "https://example.com",
        githubUrl: dto.githubUrl ?? "https://github.com"
      }
    });
  }

  update(id: string, dto: UpdateProjectDto) {
    return this.prisma.portfolioProject.update({
      where: {
        id
      },
      data: dto
    });
  }

  remove(id: string) {
    return this.prisma.portfolioProject.delete({
      where: {
        id
      }
    });
  }
}
