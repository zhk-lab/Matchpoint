import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      userId?: number;
    }>();
    const authorization = request.headers.authorization;
    if (!authorization) throw new UnauthorizedException('Missing authorization header');
    if (!authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    const token = authorization.slice(7);
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (!payload?.sub) throw new UnauthorizedException('Invalid token payload');
      request.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
