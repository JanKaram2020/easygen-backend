import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Za-z])/, { message: 'must contain a letter' })
  @Matches(/[0-9]/, { message: 'must contain a number' })
  @Matches(/(?=.*[^A-Za-z0-9])/, {
    message: 'must contain a special character',
  })
  password: string;
}
