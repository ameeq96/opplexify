import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.testimonial.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  create(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({
      data: dto
    });
  }

  update(id: string, dto: UpdateTestimonialDto) {
    return this.prisma.testimonial.update({
      where: {
        id
      },
      data: dto
    });
  }

  remove(id: string) {
    return this.prisma.testimonial.delete({
      where: {
        id
      }
    });
  }
}
