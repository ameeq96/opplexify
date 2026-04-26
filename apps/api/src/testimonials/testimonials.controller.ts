import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { TestimonialsService } from "./testimonials.service";

@Controller("testimonials")
export class TestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonials.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonials.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTestimonialDto) {
    return this.testimonials.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.testimonials.remove(id);
  }
}
