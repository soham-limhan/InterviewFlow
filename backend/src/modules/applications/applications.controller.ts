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
import { ApplicationsService } from './applications.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

import { IsOptional, IsString } from 'class-validator';

class GetApplicationsQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() jobId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() candidateId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

@ApiTags('applications')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('candidate')
  @ApiOperation({ summary: 'Apply to a job' })
  create(
    @CurrentUser('uid') uid: string,
    @Body() body: { jobId: string; resumeUrl?: string },
  ) {
    return this.applicationsService.create(uid, body.jobId, body.resumeUrl);
  }

  @Get()
  @ApiOperation({ summary: 'List applications' })
  @ApiQuery({ name: 'jobId', required: false })
  @ApiQuery({ name: 'candidateId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query() query: GetApplicationsQueryDto) {
    return this.applicationsService.findAll(
      { jobId: query.jobId, candidateId: query.candidateId, status: query.status },
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application details' })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Update application status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.applicationsService.updateStatus(id, status);
  }

  @Patch(':id/notes')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Add recruiter notes' })
  addNotes(@Param('id') id: string, @Body('notes') notes: string) {
    return this.applicationsService.addNotes(id, notes);
  }
}
