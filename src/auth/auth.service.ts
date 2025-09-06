import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
    };
  }

  async signup(email: string, name: string, password: string) {
    const user = await this.usersService.create(email, name, password);
    return this.signToken(String(user._id), user.email);
  }
}
