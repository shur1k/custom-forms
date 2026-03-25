import { Module } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthModule } from './auth/auth.module';
import { SchemasModule } from './schemas/schemas.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DrizzleModule, AuthModule, SchemasModule, UsersModule],
})
export class AppModule {}
