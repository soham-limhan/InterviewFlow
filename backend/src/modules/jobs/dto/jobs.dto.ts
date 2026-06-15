import {
  IsString,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

class SalaryRangeDto {
  @ApiProperty() @IsNumber() @Min(0) min: number;
  @ApiProperty() @IsNumber() @Min(0) max: number;
  @ApiProperty({ default: 'USD' }) @IsString() currency: string = 'USD';
}

export class CreateJobDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  skillsRequired: string[];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
  @ApiProperty() @IsString() experienceRequired: string;
  @ApiProperty({ type: SalaryRangeDto })
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salaryRange: SalaryRangeDto;
  @ApiProperty() @IsString() location: string;
  @ApiProperty({ enum: ['remote', 'onsite', 'hybrid'] })
  @IsEnum(['remote', 'onsite', 'hybrid'])
  locationType: string;
  @ApiProperty({ enum: ['full-time', 'part-time', 'contract', 'internship'] })
  @IsEnum(['full-time', 'part-time', 'contract', 'internship'])
  employmentType: string;
  @ApiPropertyOptional({ enum: ['draft', 'active'] })
  @IsOptional()
  @IsEnum(['draft', 'active'])
  status?: string = 'draft';
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}
