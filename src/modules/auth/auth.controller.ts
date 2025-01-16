import { Controller, Get, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/auth/jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
    });

    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh');
    await this.authService.logout(req.user.userId);
  }

  @Get('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.refresh(req);

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
    });

    return { accessToken };
  }
}
