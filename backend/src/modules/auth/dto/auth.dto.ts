import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  displayName: string;

  @ApiProperty({ enum: ['recruiter', 'candidate', 'admin'] })
  @IsEnum(['recruiter', 'candidate', 'admin'])
  role: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoURL?: string;
}

export class GoogleAuthDto {
  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  displayName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoURL?: string;
}

export class SetRoleDto {
  @ApiProperty({ enum: ['recruiter', 'candidate'] })
  @IsEnum(['recruiter', 'candidate'])
  role: string;
}
