import { randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { ForgotPasswordDto, LoginDto, ResetPasswordDto, UpdateProfileDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null }
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatar: true }
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, avatar: dto.avatar },
      select: { id: true, email: true, name: true, role: true, avatar: true }
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const token = randomBytes(24).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.prisma.user.updateMany({
      where: { email: dto.email, deletedAt: null },
      data: { resetToken: token, resetTokenExpiresAt }
    });

    return {
      message: "If an account exists, a password reset token has been generated.",
      resetToken: process.env.NODE_ENV === "production" ? undefined : token
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiresAt: { gt: new Date() },
        deletedAt: null
      }
    });

    if (!user) throw new UnauthorizedException("Invalid or expired reset token");

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(dto.password, 12),
        resetToken: null,
        resetTokenExpiresAt: null
      }
    });

    return { message: "Password updated successfully." };
  }
}
