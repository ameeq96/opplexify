import { IsString } from "class-validator";

export class CreateTestimonialDto {
  @IsString()
  name!: string;

  @IsString()
  role!: string;

  @IsString()
  quote!: string;
}
