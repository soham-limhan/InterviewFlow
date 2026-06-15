import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('recruiter', 'candidate', 'admin')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  getDashboard(@CurrentUser() user: { uid: string; role: string }) {
    return this.analyticsService.getDashboard(
      user.role === 'recruiter' ? user.uid : undefined,
      user.role === 'candidate' ? user.uid : undefined,
    );
  }

  @Get('funnel')
  @Roles('recruiter', 'admin')
  @ApiOperation({ summary: 'Get recruitment funnel' })
  getFunnel(@CurrentUser() user: { uid: string; role: string }) {
    return this.analyticsService.getFunnel(
      user.role === 'recruiter' ? user.uid : undefined,
    );
  }

  @Get('jobs')
  @Roles('recruiter', 'admin')
  @ApiOperation({ summary: 'Get job analytics' })
  getJobAnalytics(@CurrentUser() user: { uid: string; role: string }) {
    return this.analyticsService.getJobAnalytics(
      user.role === 'recruiter' ? user.uid : undefined,
    );
  }

  @Get('interviews')
  @Roles('recruiter', 'admin')
  @ApiOperation({ summary: 'Get interview analytics' })
  getInterviewAnalytics(@CurrentUser() user: { uid: string; role: string }) {
    return this.analyticsService.getInterviewAnalytics(
      user.role === 'recruiter' ? user.uid : undefined,
    );
  }
}
