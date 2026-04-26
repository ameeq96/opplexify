import { IsArray, IsEmail, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateQuoteDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  projectType!: string;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsString()
  timeline!: string;

  @IsString()
  budget!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsString()
  recommendedPackage!: string;

  @IsInt()
  @Min(0)
  estimatedPrice!: number;
}
