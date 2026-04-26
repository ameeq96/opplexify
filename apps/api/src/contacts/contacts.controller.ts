import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contacts.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.contacts.findAll();
  }
}
