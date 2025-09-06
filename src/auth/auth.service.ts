import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { type Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async signTokens(email: string, name: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: email, name },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        { sub: email, name },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(email: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(email, { refreshToken: hash });
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  async signup(email: string, name: string, password: string, res: Response) {
    const user = await this.usersService.create(email, name, password);
    const tokens = await this.signTokens(user.email, user.name);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return tokens;
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.signTokens(user.email, user.name);
    await this.updateRefreshToken(email, tokens.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return tokens;
  }

  async logout(email: string, res: Response) {
    res.clearCookie('refreshToken');
    await this.usersService.update(email, { refreshToken: null });
  }

  async refreshToken(email: string, refreshToken: string, res: Response) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Invalid credentials');

    const isValidRefreshToken = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isValidRefreshToken)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.signTokens(user.email, user.name);
    await this.updateRefreshToken(user.email, tokens.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return tokens;
  }
}
