import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { FormsDataService } from './forms-data.service';
import { DRIZZLE_DB } from '../drizzle/drizzle.module';

const SCHEMA_ID = 'schema-uuid';
const USER_A_ID = 'user-a-uuid';
const USER_B_ID = 'user-b-uuid';

const mockRowA = {
  id: 'row-a-uuid',
  schemaId: SCHEMA_ID,
  userId: USER_A_ID,
  values: { name: 'Alice' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const buildDbMock = () => ({
  query: {
    formsData: { findFirst: jest.fn() },
  },
  insert: jest.fn(),
  delete: jest.fn(),
});

describe('FormsDataService', () => {
  let service: FormsDataService;
  let db: ReturnType<typeof buildDbMock>;

  beforeEach(async () => {
    db = buildDbMock();
    const module = await Test.createTestingModule({
      providers: [FormsDataService, { provide: DRIZZLE_DB, useValue: db }],
    }).compile();
    service = module.get(FormsDataService);
  });

  // ── getOwn ──────────────────────────────────────────────────────────────
  describe('getOwn', () => {
    it('returns the row scoped to schemaId + userId', async () => {
      db.query.formsData.findFirst.mockResolvedValue(mockRowA);
      const result = await service.getOwn(SCHEMA_ID, USER_A_ID);
      expect(result).toEqual(mockRowA);
      expect(db.query.formsData.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
    });

    it('returns undefined when the user has no row for this schema', async () => {
      db.query.formsData.findFirst.mockResolvedValue(undefined);
      const result = await service.getOwn(SCHEMA_ID, USER_B_ID);
      expect(result).toBeUndefined();
    });
  });

  // ── submit (upsert) ─────────────────────────────────────────────────────
  describe('submit', () => {
    it('upserts by (schemaId, userId) and returns the row', async () => {
      const onConflictDoUpdateMock = jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockRowA]),
      });
      const valuesMock = jest
        .fn()
        .mockReturnValue({ onConflictDoUpdate: onConflictDoUpdateMock });
      db.insert.mockReturnValue({ values: valuesMock });

      const result = await service.submit(SCHEMA_ID, USER_A_ID, {
        name: 'Alice',
      });

      expect(result).toEqual(mockRowA);
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          schemaId: SCHEMA_ID,
          userId: USER_A_ID,
          values: { name: 'Alice' },
        }),
      );
      expect(onConflictDoUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          set: expect.objectContaining({ values: { name: 'Alice' } }),
        }),
      );
    });
  });

  // ── deleteOwn ───────────────────────────────────────────────────────────
  describe('deleteOwn', () => {
    it('deletes only the row scoped to schemaId + userId', async () => {
      const whereMock = jest.fn().mockResolvedValue(undefined);
      db.delete.mockReturnValue({ where: whereMock });

      await service.deleteOwn(SCHEMA_ID, USER_A_ID);

      expect(db.delete).toHaveBeenCalledWith(expect.anything());
      expect(whereMock).toHaveBeenCalledWith(expect.anything());
    });
  });
});
