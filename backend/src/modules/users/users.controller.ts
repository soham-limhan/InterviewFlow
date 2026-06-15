import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all users (admin only)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.usersService.update(id, data);
  }

  @Patch(':id/suspend')
  @Roles('admin')
  @ApiOperation({ summary: 'Suspend or unsuspend user' })
  suspend(@Param('id') id: string, @Body('suspended') suspended: boolean) {
    return this.usersService.suspend(id, suspended);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user' })
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
