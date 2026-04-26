import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateContactDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  projectType!: string;

  @IsString()
  budget!: string;

  @IsString()
  message!: string;
}
