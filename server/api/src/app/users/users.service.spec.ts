import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { DRIZZLE_DB } from '../drizzle/drizzle.module';

const mockDb = () => ({
  query: {
    users: { findMany: jest.fn() },
    roles: { findFirst: jest.fn() },
  },
  update: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let db: ReturnType<typeof mockDb>;

  beforeEach(async () => {
    db = mockDb();
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DRIZZLE_DB, useValue: db },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findAll', () => {
    it('returns mapped UserDto list excluding passwordHash', async () => {
      db.query.users.findMany.mockResolvedValue([
        { id: 'u1', email: 'a@b.com', passwordHash: 'hash', role: { name: 'user' }, createdAt: new Date('2024-01-01') },
        { id: 'u2', email: 'c@d.com', passwordHash: 'hash2', role: { name: 'admin' }, createdAt: new Date('2024-01-02') },
      ]);

      const result = await service.findAll();

      expect(result).toEqual([
        { id: 'u1', email: 'a@b.com', role: 'user', createdAt: new Date('2024-01-01') },
        { id: 'u2', email: 'c@d.com', role: 'admin', createdAt: new Date('2024-01-02') },
      ]);
      expect(result[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('updateRole', () => {
    const setupUpdateChain = (returning: unknown[]) => {
      const returningMock = jest.fn().mockResolvedValue(returning);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      db.update.mockReturnValue({ set: setMock });
    };

    it('returns updated UserDto on success', async () => {
      db.query.roles.findFirst.mockResolvedValue({ id: 'role-uuid', name: 'admin' });
      setupUpdateChain([{ id: 'u1', email: 'a@b.com', createdAt: new Date('2024-01-01') }]);

      const result = await service.updateRole('u1', { role: 'admin' });

      expect(result).toEqual({ id: 'u1', email: 'a@b.com', role: 'admin', createdAt: new Date('2024-01-01') });
    });

    it('throws NotFoundException when role name is unknown', async () => {
      db.query.roles.findFirst.mockResolvedValue(null);

      await expect(service.updateRole('u1', { role: 'unknown' })).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when user id is not found', async () => {
      db.query.roles.findFirst.mockResolvedValue({ id: 'role-uuid', name: 'admin' });
      setupUpdateChain([]);

      await expect(service.updateRole('nonexistent', { role: 'admin' })).rejects.toThrow(NotFoundException);
    });
  });
});
