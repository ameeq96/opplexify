import { IsArray, IsInt, IsString, Min } from "class-validator";

export class CreatePricingDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsString()
  label!: string;

  @IsString()
  description!: string;

  @IsString()
  timeline!: string;

  @IsArray()
  @IsString({ each: true })
  features!: string[];
}
