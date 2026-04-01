import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('邮箱或用户名已被注册');
    }

    const hashedPassword = await hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        hashedPassword,
      },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    await this.prisma.aiUserProfile.create({
      data: { userId: user.id },
    });

    const accessToken = await this.signToken(user.id);
    return { accessToken, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
      },
      select: {
        id: true,
        email: true,
        username: true,
        hashedPassword: true,
        createdAt: true,
      },
    });

    if (!user || !user.hashedPassword) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const passwordMatched = await compare(dto.password, user.hashedPassword);
    if (!passwordMatched) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const accessToken = await this.signToken(user.id);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('用户不存在');
    return user;
  }

  private async signToken(userId: number): Promise<string> {
    return this.jwtService.signAsync({ sub: userId });
  }
}
