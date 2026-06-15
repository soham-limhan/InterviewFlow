import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, GoogleAuthDto, SetRoleDto } from './dto/auth.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('google')
  @ApiOperation({ summary: 'Authenticate with Google' })
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('uid') uid: string) {
    return this.authService.getProfile(uid);
  }

  @Post('set-role')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Set user role (first login)' })
  async setRole(@CurrentUser() user: any, @Body() dto: SetRoleDto) {
    return this.authService.setRole(
      user.uid,
      dto.role,
      user.email,
      user.displayName,
      user.photoURL,
    );
  }
}
