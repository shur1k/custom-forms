import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSchemaDto {
  @ApiProperty({ example: 'My Registration Form' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ enum: ['form', 'page', 'dashboard'], example: 'form' })
  @IsIn(['form', 'page', 'dashboard'])
  type!: 'form' | 'page' | 'dashboard';

  @ApiPropertyOptional({ description: 'JSON Schema 2020-12 + x-ui document' })
  @IsOptional()
  @IsObject()
  schema?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'my-registration-form' })
  @IsOptional()
  @IsString()
  slug?: string;
}
