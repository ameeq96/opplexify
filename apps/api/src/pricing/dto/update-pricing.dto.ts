import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdatePricingDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
