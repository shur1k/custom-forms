import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE_DB, DrizzleDB } from '../drizzle/drizzle.module';
import { schemas, schemasTypes, schemasVersions } from '../../db/schema';
import type { CreateSchemaDto } from './dto/create-schema.dto';
import type { UpdateSchemaDto } from './dto/update-schema.dto';

@Injectable()
export class SchemasService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  async create(dto: CreateSchemaDto, ownerId: string) {
    const type = await this.db.query.schemasTypes.findFirst({
      where: eq(schemasTypes.name, dto.type),
    });
    if (!type) throw new NotFoundException(`Schema type '${dto.type}' not found`);

    const [created] = await this.db
      .insert(schemas)
      .values({
        title: dto.title,
        typeId: type.id,
        ownerId,
        schema: dto.schema ?? {},
        slug: dto.slug ?? null,
      })
      .returning();
    return created;
  }

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.query.schemas.findMany({
      orderBy: [desc(schemas.createdAt)],
      limit,
      offset,
      with: { type: true },
    });
  }

  async findOne(id: string) {
    const schema = await this.db.query.schemas.findFirst({
      where: eq(schemas.id, id),
      with: { type: true },
    });
    if (!schema) throw new NotFoundException('Schema not found');
    return schema;
  }

  async update(id: string, dto: UpdateSchemaDto, userId: string) {
    const existing = await this.findOne(id);
    if (existing.ownerId !== userId) throw new ForbiddenException();

    const [updated] = await this.db
      .update(schemas)
      .set({
        ...(dto.title && { title: dto.title }),
        ...(dto.schema && { schema: dto.schema }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        updatedAt: new Date(),
      })
      .where(eq(schemas.id, id))
      .returning();
    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id);
    if (existing.ownerId !== userId) throw new ForbiddenException();
    await this.db.delete(schemas).where(eq(schemas.id, id));
  }

  async publish(id: string, userId: string) {
    const existing = await this.findOne(id);
    if (existing.ownerId !== userId) throw new ForbiddenException();

    const versions = await this.db.query.schemasVersions.findMany({
      where: eq(schemasVersions.schemaId, id),
    });
    const nextVersion = `v${versions.length + 1}`;

    const [version] = await this.db
      .insert(schemasVersions)
      .values({ schemaId: id, version: nextVersion, schema: existing.schema ?? {} })
      .returning();
    return version;
  }

  async findVersions(id: string) {
    await this.findOne(id); // ensure exists
    return this.db.query.schemasVersions.findMany({
      where: eq(schemasVersions.schemaId, id),
      orderBy: [desc(schemasVersions.publishedAt)],
    });
  }
}
