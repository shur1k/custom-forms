import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SchemasService } from './schemas.service';
import { DRIZZLE_DB } from '../drizzle/drizzle.module';

const OWNER_ID   = 'owner-uuid';
const OTHER_ID   = 'other-uuid';
const SCHEMA_ID  = 'schema-uuid';
const TYPE_ID    = 'type-uuid';
const VERSION_ID = 'version-uuid';

const mockType    = { id: TYPE_ID, name: 'form', description: 'Form', createdAt: new Date() };
const mockSchema  = { id: SCHEMA_ID, ownerId: OWNER_ID, typeId: TYPE_ID, title: 'My Form', slug: null, schema: {}, createdAt: new Date(), updatedAt: new Date(), type: mockType };
const mockVersion = { id: VERSION_ID, schemaId: SCHEMA_ID, version: 'v1', schema: {}, publishedAt: new Date() };

const buildDbMock = () => ({
  query: {
    schemasTypes:    { findFirst: jest.fn() },
    schemas:         { findFirst: jest.fn(), findMany: jest.fn() },
    schemasVersions: { findMany: jest.fn() },
  },
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('SchemasService', () => {
  let service: SchemasService;
  let db: ReturnType<typeof buildDbMock>;

  beforeEach(async () => {
    db = buildDbMock();
    const module = await Test.createTestingModule({
      providers: [SchemasService, { provide: DRIZZLE_DB, useValue: db }],
    }).compile();
    service = module.get(SchemasService);
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('creates and returns a schema', async () => {
      db.query.schemasTypes.findFirst.mockResolvedValue(mockType);
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([mockSchema]) }),
      });

      const result = await service.create({ title: 'My Form', type: 'form' }, OWNER_ID);
      expect(result).toEqual(mockSchema);
    });

    it('throws NotFoundException for unknown type', async () => {
      db.query.schemasTypes.findFirst.mockResolvedValue(null);
      await expect(service.create({ title: 'X', type: 'form' }, OWNER_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('returns paginated schemas', async () => {
      db.query.schemas.findMany.mockResolvedValue([mockSchema]);
      const result = await service.findAll(1, 20);
      expect(result).toEqual([mockSchema]);
      expect(db.query.schemas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20, offset: 0 }),
      );
    });

    it('calculates correct offset for page 2', async () => {
      db.query.schemas.findMany.mockResolvedValue([]);
      await service.findAll(2, 10);
      expect(db.query.schemas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 10 }),
      );
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns the schema when found', async () => {
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      const result = await service.findOne(SCHEMA_ID);
      expect(result).toEqual(mockSchema);
    });

    it('throws NotFoundException when not found', async () => {
      db.query.schemas.findFirst.mockResolvedValue(null);
      await expect(service.findOne('no-such-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('updates and returns the schema when owner matches', async () => {
      const updated = { ...mockSchema, title: 'New Title' };
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([updated]) }),
        }),
      });

      const result = await service.update(SCHEMA_ID, { title: 'New Title' }, OWNER_ID);
      expect(result).toEqual(updated);
    });

    it('throws ForbiddenException when caller is not the owner', async () => {
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      await expect(service.update(SCHEMA_ID, { title: 'X' }, OTHER_ID))
        .rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when schema does not exist', async () => {
      db.query.schemas.findFirst.mockResolvedValue(null);
      await expect(service.update('bad-id', { title: 'X' }, OWNER_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('deletes the schema when owner matches', async () => {
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      db.delete.mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) });

      await expect(service.remove(SCHEMA_ID, OWNER_ID)).resolves.toBeUndefined();
    });

    it('throws ForbiddenException when caller is not the owner', async () => {
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      await expect(service.remove(SCHEMA_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  // ── publish ───────────────────────────────────────────────────────────────
  describe('publish', () => {
    it('creates v1 snapshot when no previous versions exist', async () => {
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      db.query.schemasVersions.findMany.mockResolvedValue([]);
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([mockVersion]) }),
      });

      const result = await service.publish(SCHEMA_ID, OWNER_ID);
      expect(result).toEqual(mockVersion);
      expect(db.insert).toHaveBeenCalledWith(expect.anything());
    });

    it('increments version number based on existing snapshots', async () => {
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      db.query.schemasVersions.findMany.mockResolvedValue([mockVersion]);
      const v2 = { ...mockVersion, version: 'v2' };
      const valuesMock = jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([v2]) });
      db.insert.mockReturnValue({ values: valuesMock });

      const result = await service.publish(SCHEMA_ID, OWNER_ID);
      expect(result.version).toBe('v2');
      expect(valuesMock).toHaveBeenCalledWith(expect.objectContaining({ version: 'v2' }));
    });

    it('throws ForbiddenException when caller is not the owner', async () => {
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      await expect(service.publish(SCHEMA_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  // ── findVersions ──────────────────────────────────────────────────────────
  describe('findVersions', () => {
    it('returns versions list', async () => {
      db.query.schemas.findFirst.mockResolvedValue(mockSchema);
      db.query.schemasVersions.findMany.mockResolvedValue([mockVersion]);

      const result = await service.findVersions(SCHEMA_ID);
      expect(result).toEqual([mockVersion]);
    });

    it('throws NotFoundException when schema does not exist', async () => {
      db.query.schemas.findFirst.mockResolvedValue(null);
      await expect(service.findVersions('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
