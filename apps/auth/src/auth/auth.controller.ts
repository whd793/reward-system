import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { UsersService } from '../users/users.service';

/**
 * 인증 컨트롤러
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService, // Add this injection
  ) {}

  /**
   * 로그인
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Request() req, @Body() loginUserDto: LoginUserDto) {
    this.logger.log(`Login attempt for user: ${loginUserDto.username}`);
    return this.authService.login(req.user);
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
    return this.authService.register(createUserDto);
  }

  /**
   * 토큰 검증 (마이크로서비스 내부 통신용)
   */
  @MessagePattern('auth.validateToken')
  async validateToken(@Payload() token: string) {
    this.logger.log('[Microservice] Token validation request');
    return this.authService.validateToken(token);
  }

  /**
   * 로그인 (마이크로서비스 내부 통신용)
   */
  @MessagePattern('auth.login')
  async loginViaMicroservice(@Payload() loginUserDto: LoginUserDto) {
    this.logger.log(`[Microservice] Login attempt for user: ${loginUserDto.username}`);

    try {
      const user = await this.authService.validateUser(
        loginUserDto.username,
        loginUserDto.password,
      );

      if (!user) {
        throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
      }

      return this.authService.login(user);
    } catch (error) {
      this.logger.error(`[Microservice] Login error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 회원가입 (마이크로서비스 내부 통신용)
   */
  @MessagePattern('auth.register')
  async registerViaMicroservice(@Payload() createUserDto: CreateUserDto) {
    this.logger.log(`[Microservice] Registration attempt for user: ${createUserDto.username}`);

    try {
      return this.authService.register(createUserDto);
    } catch (error) {
      this.logger.error(`[Microservice] Registration error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자 ID로 사용자 조회 (마이크로서비스 내부 통신용)
   */
  @MessagePattern('user.findById')
  async findByIdViaMicroservice(@Payload() userId: string) {
    this.logger.log(`[Microservice] Finding user by ID: ${userId}`);

    try {
      return this.usersService.findById(userId);
    } catch (error) {
      this.logger.error(`[Microservice] Find user error: ${error.message}`, error.stack);
      throw error;
    }
  }
}

// import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { AuthService } from './auth.service';
// import { CreateUserDto } from '../dto/create-user.dto';
// import { LoginUserDto } from '../dto/login-user.dto';
// import { LocalAuthGuard } from './guards/local-auth.guard';
// import { Public } from './decorators/public.decorator';

// /**
//  * 인증 컨트롤러
//  */
// @ApiTags('auth')
// @Controller('auth')
// export class AuthController {
//   private readonly logger = new Logger(AuthController.name);

//   constructor(private readonly authService: AuthService) {}

//   /**
//    * 로그인
//    */
//   @Public()
//   @UseGuards(LocalAuthGuard)
//   @Post('login')
//   @ApiOperation({ summary: '로그인' })
//   @ApiResponse({ status: 200, description: '로그인 성공' })
//   @ApiResponse({ status: 401, description: '인증 실패' })
//   async login(@Request() req, @Body() loginUserDto: LoginUserDto) {
//     this.logger.log(`Login attempt for user: ${loginUserDto.username}`);
//     return this.authService.login(req.user);
//   }

//   /**
//    * 회원가입
//    */
//   @Public()
//   @Post('register')
//   @ApiOperation({ summary: '회원가입' })
//   @ApiResponse({ status: 201, description: '회원가입 성공' })
//   @ApiResponse({ status: 400, description: '잘못된 입력' })
//   @ApiResponse({ status: 409, description: '중복된 사용자명 또는 이메일' })
//   async register(@Body() createUserDto: CreateUserDto) {
//     this.logger.log(`Registration attempt for user: ${createUserDto.username}`);
//     return this.authService.register(createUserDto);
//   }

//   /**
//    * 토큰 검증 (마이크로서비스 내부 통신용)
//    */
//   @MessagePattern('auth.validateToken')
//   async validateToken(@Payload() token: string) {
//     this.logger.log('[Microservice] Token validation request');
//     return this.authService.validateToken(token);
//   }
// }
