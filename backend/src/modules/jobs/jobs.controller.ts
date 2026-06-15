import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto/jobs.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class GetJobsQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() employmentType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() locationType?: string;
}

@ApiTags('jobs')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Create a new job' })
  create(@CurrentUser('uid') uid: string, @Body() dto: CreateJobDto) {
    return this.jobsService.create(uid, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List jobs with filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'employmentType', required: false })
  @ApiQuery({ name: 'locationType', required: false })
  findAll(@Query() query: GetJobsQueryDto) {
    return this.jobsService.findAll(query.page, query.limit, {
      status: query.status,
      search: query.search,
      employmentType: query.employmentType,
      locationType: query.locationType,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job details' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Update job' })
  update(
    @Param('id') id: string,
    @CurrentUser('uid') uid: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, uid, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Delete job' })
  delete(@Param('id') id: string, @CurrentUser('uid') uid: string) {
    return this.jobsService.delete(id, uid);
  }

  @Get(':id/applicants')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'List applicants for a job' })
  getApplicants(@Param('id') id: string, @Query() pagination: PaginationDto) {
    return this.jobsService.getApplicants(
      id,
      pagination.page,
      pagination.limit,
    );
  }
}
