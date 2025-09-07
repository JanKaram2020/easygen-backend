import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import type { Request, Response } from 'express';
import { ApiCookieAuth, ApiHeader } from '@nestjs/swagger';

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signup(dto.email, dto.name, dto.password, res);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto.email, dto.password, res);
  }

  @ApiCookieAuth('refreshTokenCookie')
  @Post('refresh')
  refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    return this.authService.refreshToken(refreshToken, res);
  }

  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiCookieAuth('refreshTokenCookie')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Req() req: { user: { email: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req.user.email, res);
  }

  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiCookieAuth('refreshTokenCookie')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { email: string; name: string } }) {
    const { email, name } = req.user;
    return { email, name };
  }
}
