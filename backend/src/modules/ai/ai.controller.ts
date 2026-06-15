import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('ai')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard, RolesGuard)
@Roles('recruiter', 'admin')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-resume')
  @ApiOperation({ summary: 'Analyze resume with AI' })
  analyzeResume(@Body() body: { resumeText: string; jobId?: string }) {
    return this.aiService.analyzeResume(body.resumeText, body.jobId);
  }

  @Post('generate-questions')
  @ApiOperation({ summary: 'Generate interview questions' })
  generateQuestions(
    @CurrentUser('uid') uid: string,
    @Body() body: { skill: string; difficulty: string; count?: number },
  ) {
    return this.aiService.generateQuestions(
      body.skill,
      body.difficulty,
      body.count,
      uid,
    );
  }

  @Post('interview-summary')
  @ApiOperation({ summary: 'Generate interview summary' })
  interviewSummary(
    @Body() body: { interviewId: string; transcript: string; notes?: string },
  ) {
    return this.aiService.generateInterviewSummary(
      body.interviewId,
      body.transcript,
      body.notes,
    );
  }

  @Post('rank-candidates')
  @ApiOperation({ summary: 'Rank candidates for a job' })
  rankCandidates(@Body() body: { jobId: string }) {
    return this.aiService.rankCandidates(body.jobId);
  }

  @Get('reports')
  @ApiOperation({ summary: 'List AI reports' })
  getReports(@Query() pagination: PaginationDto) {
    return this.aiService.getReports(pagination.page, pagination.limit);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get AI report' })
  getReport(@Param('id') id: string) {
    return this.aiService.getReport(id);
  }
}
