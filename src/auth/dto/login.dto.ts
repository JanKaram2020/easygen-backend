import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Za-z])/, { message: 'must contain a letter' })
  @Matches(/[0-9]/, { message: 'must contain a number' })
  @Matches(/(?=.*[^A-Za-z0-9])/, {
    message: 'must contain a special character',
  })
  @ApiProperty()
  password: string;
}
