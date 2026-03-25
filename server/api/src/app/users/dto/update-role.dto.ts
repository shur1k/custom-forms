import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ enum: ['user', 'admin', 'superuser'] })
  @IsIn(['user', 'admin', 'superuser'])
  role!: string;
}
