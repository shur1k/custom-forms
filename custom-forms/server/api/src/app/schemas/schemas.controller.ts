import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SchemasService } from './schemas.service';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';

@ApiTags('schemas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schemas')
export class SchemasController {
  constructor(private readonly schemasService: SchemasService) {}

  @Get()
  @ApiOperation({ summary: 'List all schemas' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.schemasService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one schema' })
  findOne(@Param('id') id: string) {
    return this.schemasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a schema' })
  create(@Body() dto: CreateSchemaDto, @Request() req: { user: { userId: string } }) {
    return this.schemasService.create(dto, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a schema' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSchemaDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.schemasService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a schema' })
  remove(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.schemasService.remove(id, req.user.userId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a version snapshot' })
  publish(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.schemasService.publish(id, req.user.userId);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'List published versions' })
  findVersions(@Param('id') id: string) {
    return this.schemasService.findVersions(id);
  }
}
