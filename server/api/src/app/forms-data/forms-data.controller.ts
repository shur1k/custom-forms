import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SchemasService } from '../schemas/schemas.service';
import { FormsDataService } from './forms-data.service';
import { SubmitFormsDataDto } from './dto/submit-forms-data.dto';
import {
  sanitizeFormValues,
  validateFormValues,
} from './forms-data.validation';

type ReqUser = { user: { userId: string; role: string } };

@ApiTags('forms-data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schemas/:schemaId/forms-data')
export class FormsDataController {
  constructor(
    private readonly formsDataService: FormsDataService,
    private readonly schemasService: SchemasService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get a published form plus the caller's own forms data",
  })
  async get(@Param('schemaId') schemaId: string, @Request() req: ReqUser) {
    const schema = await this.schemasService.findPublishedById(schemaId);
    const own = await this.formsDataService.getOwn(schemaId, req.user.userId);
    return { schema, values: own?.values ?? null };
  }

  @Put()
  @ApiOperation({
    summary: "Submit (create or overwrite) the caller's own forms data",
  })
  async submit(
    @Param('schemaId') schemaId: string,
    @Body() dto: SubmitFormsDataDto,
    @Request() req: ReqUser,
  ) {
    const schema = await this.schemasService.findPublishedById(schemaId);

    const values = sanitizeFormValues(schema.schema ?? {}, dto.values);
    const errors = validateFormValues(schema.schema ?? {}, values);
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: 'Validation failed', errors });
    }

    return this.formsDataService.submit(schemaId, req.user.userId, values);
  }

  @Delete()
  @ApiOperation({ summary: "Delete the caller's own forms data" })
  async remove(@Param('schemaId') schemaId: string, @Request() req: ReqUser) {
    await this.formsDataService.deleteOwn(schemaId, req.user.userId);
  }
}
