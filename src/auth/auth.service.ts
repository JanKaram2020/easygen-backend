import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { type Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async signTokens(email: string, name: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: email, name },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      ),
      this.jwtService.signAsync(
        { sub: email, name },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
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
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  async signup(email: string, name: string, password: string, res: Response) {
    const user = await this.usersService.create(email, name, password);
    const { refreshToken, accessToken } = await this.signTokens(
      user.email,
      user.name,
    );
    await this.updateRefreshToken(user.email, refreshToken);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const { refreshToken, accessToken } = await this.signTokens(
      user.email,
      user.name,
    );
    await this.updateRefreshToken(email, refreshToken);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  async logout(email: string, res: Response) {
    res.clearCookie('refreshToken');
    await this.usersService.update(email, { refreshToken: null });
  }

  async refreshToken(existingRefreshToken: string, res: Response) {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      name: string;
    }>(existingRefreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    const user = await this.usersService.findByEmail(payload.sub);

    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Invalid credentials');

    const isValidRefreshToken = await bcrypt.compare(
      existingRefreshToken,
      user.refreshToken,
    );
    if (!isValidRefreshToken)
      throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.signTokens(
      user.email,
      user.name,
    );
    await this.updateRefreshToken(user.email, refreshToken);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }
}
