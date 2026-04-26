import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePricingDto } from "./dto/create-pricing.dto";
import { UpdatePricingDto } from "./dto/update-pricing.dto";

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pricingPackage.findMany({
      orderBy: {
        price: "asc"
      }
    });
  }

  create(dto: CreatePricingDto) {
    return this.prisma.pricingPackage.create({
      data: dto
    });
  }

  update(id: string, dto: UpdatePricingDto) {
    return this.prisma.pricingPackage.update({
      where: {
        id
      },
      data: dto
    });
  }

  remove(id: string) {
    return this.prisma.pricingPackage.delete({
      where: {
        id
      }
    });
  }
}
