import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class SubmitFormsDataDto {
  @ApiProperty({
    description:
      "The submitted field values, keyed by the schema's component ids",
  })
  @IsObject()
  values!: Record<string, unknown>;
}
