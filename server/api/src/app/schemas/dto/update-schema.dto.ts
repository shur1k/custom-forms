import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSchemaDto {
  @ApiPropertyOptional({ example: 'Updated Form Title' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ description: 'JSON Schema 2020-12 + x-ui document' })
  @IsOptional()
  @IsObject()
  schema?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'my-updated-form' })
  @IsOptional()
  @IsString()
  slug?: string;
}
