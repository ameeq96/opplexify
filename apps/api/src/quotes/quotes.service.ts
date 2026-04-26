import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuoteDto } from "./dto/create-quote.dto";

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateQuoteDto) {
    return this.prisma.quoteRequest.create({
      data: dto
    });
  }

  findAll() {
    return this.prisma.quoteRequest.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
  }
}
