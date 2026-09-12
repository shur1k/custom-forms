import { Module } from '@nestjs/common';
import { SchemasModule } from '../schemas/schemas.module';
import { FormsDataController } from './forms-data.controller';
import { FormsDataService } from './forms-data.service';

@Module({
  imports: [SchemasModule],
  controllers: [FormsDataController],
  providers: [FormsDataService],
})
export class FormsDataModule {}
