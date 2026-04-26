import { IsOptional, IsString } from "class-validator";

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  quote?: string;
}
