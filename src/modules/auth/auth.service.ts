import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existUser = await this.userService.findByEmail(registerDto.email);
    if (existUser) {
      throw new BadRequestException('User already exist');
    }

    registerDto.password = await bcrypt.hash(registerDto.password, 10);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = await this.userService.create(registerDto);
    return result;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
      expiresIn: '10m',
    });

    const refreshToken = await this.jwtService.signAsync(
      { userId: user.id },
      {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    await this.userService.update(user.id, { refreshToken });

    return { accessToken, refreshToken };
  }

  async logout(userId: number) {
    await this.userService.update(userId, { refreshToken: null });
  }

  async refresh(req: any) {
    const cookies = req.cookies;
    if (!cookies?.refresh) {
      throw new UnauthorizedException();
    }

    const refreshToken = cookies.refresh;
    const user = await this.userService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new ForbiddenException();
    }

    const { userId } = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
    });

    if (user.id !== userId) {
      throw new ForbiddenException();
    }

    const jwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
      expiresIn: '10m',
    });

    const newRefreshToken = await this.jwtService.signAsync(
      { userId: user.id },
      {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    await this.userService.update(user.id, { refreshToken: newRefreshToken });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
