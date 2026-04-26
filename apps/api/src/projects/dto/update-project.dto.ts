import { IsArray, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  problem?: string;

  @IsOptional()
  @IsString()
  solution?: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tech?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsUrl({ require_protocol: true })
  liveUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubUrl?: string;
}
