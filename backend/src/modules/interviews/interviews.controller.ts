import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { ScheduleInterviewDto } from './dto/interviews.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

class GetInterviewsQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

@ApiTags('interviews')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('schedule')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Schedule an interview' })
  schedule(@CurrentUser('uid') uid: string, @Body() dto: ScheduleInterviewDto) {
    return this.interviewsService.schedule(uid, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List interviews' })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query() query: GetInterviewsQueryDto,
    @CurrentUser() user: { uid: string; role: string },
  ) {
    const filters: Record<string, string> = {};
    if (query.status) filters.status = query.status;
    if (user.role === 'recruiter') filters.recruiterId = user.uid;
    if (user.role === 'candidate') filters.candidateId = user.uid;
    return this.interviewsService.findAll(
      filters,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview details' })
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Update interview status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.interviewsService.updateStatus(id, status);
  }

  @Post(':id/token')
  @ApiOperation({ summary: 'Generate LiveKit token for interview' })
  generateToken(
    @Param('id') id: string,
    @CurrentUser() user: { uid: string; displayName: string },
  ) {
    return this.interviewsService.generateToken(id, user.uid, user.displayName);
  }

  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Mark interview as completed' })
  complete(@Param('id') id: string) {
    return this.interviewsService.complete(id);
  }
}
