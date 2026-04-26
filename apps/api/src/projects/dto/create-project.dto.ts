import { IsArray, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  category!: string;

  @IsString()
  summary!: string;

  @IsString()
  problem!: string;

  @IsString()
  solution!: string;

  @IsString()
  result!: string;

  @IsUrl({ require_protocol: true })
  image!: string;

  @IsArray()
  @IsString({ each: true })
  tech!: string[];

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsOptional()
  @IsUrl({ require_protocol: true })
  liveUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubUrl?: string;
}
