import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_DB, DrizzleDB } from '../drizzle/drizzle.module';
import { formsData } from '../../db/schema';

@Injectable()
export class FormsDataService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  async getOwn(schemaId: string, userId: string) {
    return this.db.query.formsData.findFirst({
      where: and(
        eq(formsData.schemaId, schemaId),
        eq(formsData.userId, userId),
      ),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async submit(schemaId: string, userId: string, values: Record<string, any>) {
    const [row] = await this.db
      .insert(formsData)
      .values({ schemaId, userId, values })
      .onConflictDoUpdate({
        target: [formsData.schemaId, formsData.userId],
        set: { values, updatedAt: new Date() },
      })
      .returning();
    return row;
  }

  async deleteOwn(schemaId: string, userId: string) {
    await this.db
      .delete(formsData)
      .where(
        and(eq(formsData.schemaId, schemaId), eq(formsData.userId, userId)),
      );
  }
}
