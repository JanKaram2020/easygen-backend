import { IsString, MinLength } from 'class-validator';
import { LoginDto } from './login.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto extends LoginDto {
  @IsString()
  @MinLength(3)
  @ApiProperty()
  name: string;
}
