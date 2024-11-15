import { IsString, IsEmail, MinLength } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Email must be at least 3 characters long' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
