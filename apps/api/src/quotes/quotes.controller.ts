import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateQuoteDto } from "./dto/create-quote.dto";
import { QuotesService } from "./quotes.service";

@Controller("quotes")
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotes.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.quotes.findAll();
  }
}
