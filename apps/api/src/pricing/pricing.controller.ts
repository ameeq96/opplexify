import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePricingDto } from "./dto/create-pricing.dto";
import { UpdatePricingDto } from "./dto/update-pricing.dto";
import { PricingService } from "./pricing.service";

@Controller("pricing")
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Get()
  findAll() {
    return this.pricing.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePricingDto) {
    return this.pricing.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdatePricingDto) {
    return this.pricing.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pricing.remove(id);
  }
}
