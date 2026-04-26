import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@UseGuards(JwtAuthGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("overview")
  async overview() {
    const [contacts, quotes, projects, testimonials, pricing] = await Promise.all([
      this.prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.portfolioProject.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.pricingPackage.findMany({ orderBy: { price: "asc" } })
    ]);

    return {
      contacts,
      quotes,
      projects,
      testimonials,
      pricing
    };
  }
}
