import { Controller, Post, Body, Logger, Inject, Get, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Public } from '../decorators/public.decorator';

/**
 * 인증 컨트롤러 (게이트웨이)
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  /**
   * 로그인
   */
  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginUserDto: LoginUserDto) {
    this.logger.log(`Login attempt for user: ${loginUserDto.username}`);

    try {
      return await firstValueFrom(this.authClient.send('auth.login', loginUserDto));
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 회원가입
   */
  @Public()
  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 입력' })
  @ApiResponse({ status: 409, description: '중복된 사용자명 또는 이메일' })
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Registration attempt for user: ${createUserDto.username}`);

    try {
      return await firstValueFrom(this.authClient.send('auth.register', createUserDto));
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '현재 사용자 정보' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getProfile(@Request() req) {
    this.logger.log(`Getting profile for user ID: ${req.user.userId}`);

    try {
      return await firstValueFrom(this.authClient.send('user.findById', req.user.userId));
    } catch (error) {
      this.logger.error(`Get profile failed: ${error.message}`);
      throw error;
    }
  }
}

// import { Controller, Post, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';
// import { firstValueFrom } from 'rxjs';
// import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { Public } from '../decorators/public.decorator';

// @ApiTags('인증')
// @Controller('auth')
// export class AuthController {
//   constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

//   @Public()
//   @Post('register')
//   @ApiOperation({ summary: '사용자 등록', description: '새 사용자를 시스템에 등록합니다.' })
//   @ApiResponse({ status: 201, description: '사용자가 성공적으로 등록되었습니다.' })
//   @ApiResponse({ status: 400, description: '사용자 정보가 유효하지 않습니다.' })
//   async register(@Body() createUserDto: any) {
//     return await firstValueFrom(this.authClient.send('register_user', createUserDto));
//   }

//   @Public()
//   @Post('login')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: '사용자 로그인', description: '사용자 인증 후 JWT 토큰을 발급합니다.' })
//   @ApiResponse({ status: 200, description: '로그인에 성공하고 토큰이 발급되었습니다.' })
//   @ApiResponse({ status: 401, description: '로그인 정보가 유효하지 않습니다.' })
//   async login(@Body() loginUserDto: any) {
//     return await firstValueFrom(this.authClient.send('login_user', loginUserDto));
//   }
// }
