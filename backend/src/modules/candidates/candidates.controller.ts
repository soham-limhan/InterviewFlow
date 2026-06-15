import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('candidates')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('recruiter', 'admin')
  @ApiOperation({ summary: 'List all candidates' })
  findAll(@Query() pagination: PaginationDto) {
    return this.candidatesService.findAll(pagination.page, pagination.limit);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('recruiter', 'admin')
  @ApiOperation({ summary: 'Get candidate profile' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update candidate profile' })
  update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.candidatesService.update(id, data);
  }
}
