import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  async signup(signupDto: SignupDto) {
    const userExists = false;
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    return { message: 'User signed up successfully' };
  }

  async login(loginDto: LoginDto) {
    return { message: 'User logged in successfully' };
  }
}
