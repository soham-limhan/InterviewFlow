import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleInterviewDto {
  @ApiProperty() @IsString() jobId: string;
  @ApiProperty() @IsString() applicationId: string;
  @ApiProperty() @IsString() candidateId: string;
  @ApiProperty() @IsString() scheduledAt: string;
  @ApiProperty({ minimum: 15, maximum: 180 })
  @IsNumber()
  @Min(15)
  @Max(180)
  duration: number;
}
