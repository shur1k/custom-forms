import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UsersService } from './users.service';

type ReqUser = { user: { userId: string; role: string } };

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superuser')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (superuser only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a user (superuser only)' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a user's email (superuser only)" })
  updateEmail(@Param('id') id: string, @Body() dto: UpdateEmailDto) {
    return this.usersService.updateEmail(id, dto);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update a user role (superuser only)' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (superuser only)' })
  remove(@Param('id') id: string, @Request() req: ReqUser) {
    return this.usersService.remove(id, req.user.userId);
  }
}
