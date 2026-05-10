import { Body, CallHandler, Controller, ExecutionContext, Get, Injectable, NestInterceptor, Param, Post, Query, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Observable } from "rxjs";
import { CmsService } from "./cms.service";
import { CreateContactMessageDto } from "./dto/contact.dto";

@Injectable()
class PublicCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method?: string }>();

    if (request.method === "GET") {
      context
        .switchToHttp()
        .getResponse<{ setHeader: (name: string, value: string) => void }>()
        .setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    }

    return next.handle();
  }
}

@ApiTags("Public")
@UseInterceptors(PublicCacheInterceptor)
@Controller("public")
export class CmsController {
  constructor(private readonly cms: CmsService) {}

  @Get("site")
  site() {
    return this.cms.publicSite();
  }

  @Get("pages/:slug")
  page(@Param("slug") slug: string) {
    return this.cms.publicPage(slug);
  }

  @Get("services")
  services(@Query("featured") featured?: string) {
    return this.cms.listPublicServices(featured === "true");
  }

  @Get("services/:slug")
  service(@Param("slug") slug: string) {
    return this.cms.getPublicBySlug("service", slug);
  }

  @Get("projects")
  projects(@Query("featured") featured?: string) {
    return this.cms.listPublicProjects(featured === "true");
  }

  @Get("projects/:slug")
  project(@Param("slug") slug: string) {
    return this.cms.getPublicBySlug("project", slug);
  }

  @Get("portfolio-items")
  portfolioItems(@Query("featured") featured?: string) {
    return this.cms.listPublicPortfolioItems(featured === "true");
  }

  @Get("blog")
  posts(@Query("featured") featured?: string) {
    return this.cms.listPublicPosts(featured === "true");
  }

  @Get("blog/:slug")
  post(@Param("slug") slug: string) {
    return this.cms.getPublicBySlug("blogPost", slug);
  }

  @Get("team")
  team() {
    return this.cms.listPublicTeam();
  }

  @Get("team/:slug")
  teamMember(@Param("slug") slug: string) {
    return this.cms.getPublicBySlug("teamMember", slug);
  }

  @Get("faqs")
  faqs() {
    return this.cms.listPublicFaqs();
  }

  @Get("testimonials")
  testimonials() {
    return this.cms.listPublicTestimonials();
  }

  @Post("contact")
  contact(@Body() dto: CreateContactMessageDto) {
    return this.cms.createContactMessage(dto);
  }
}
