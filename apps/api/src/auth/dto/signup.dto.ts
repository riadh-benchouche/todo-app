import { IsString, IsEmail, MinLength } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'Username must be a string' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
