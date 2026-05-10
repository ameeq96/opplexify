import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@opplexify.local" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Admin123!" })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: "admin@opplexify.local" })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class UpdateProfileDto {
  @IsString()
  name!: string;

  @IsString()
  avatar?: string;
}
