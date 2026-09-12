import { Module } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthModule } from './auth/auth.module';
import { FormsDataModule } from './forms-data/forms-data.module';
import { SchemasModule } from './schemas/schemas.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DrizzleModule,
    AuthModule,
    SchemasModule,
    FormsDataModule,
    UsersModule,
  ],
})
export class AppModule {}
