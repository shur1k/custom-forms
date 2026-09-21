import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { DRIZZLE_DB } from '../drizzle/drizzle.module';
import { UsersService } from './users.service';

import 'reflect-metadata';

const mockDb = () => ({
  query: {
    users: { findFirst: jest.fn(), findMany: jest.fn() },
    roles: { findFirst: jest.fn() },
  },
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let db: ReturnType<typeof mockDb>;

  beforeEach(async () => {
    db = mockDb();
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: DRIZZLE_DB, useValue: db }],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findAll', () => {
    it('returns mapped UserDto list excluding passwordHash', async () => {
      db.query.users.findMany.mockResolvedValue([
        {
          id: 'u1',
          email: 'a@b.com',
          passwordHash: 'hash',
          role: { name: 'user' },
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'u2',
          email: 'c@d.com',
          passwordHash: 'hash2',
          role: { name: 'admin' },
          createdAt: new Date('2024-01-02'),
        },
      ]);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: 'u1',
          email: 'a@b.com',
          role: 'user',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'u2',
          email: 'c@d.com',
          role: 'admin',
          createdAt: new Date('2024-01-02'),
        },
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
      db.query.roles.findFirst.mockResolvedValue({
        id: 'role-uuid',
        name: 'admin',
      });
      setupUpdateChain([
        { id: 'u1', email: 'a@b.com', createdAt: new Date('2024-01-01') },
      ]);

      const result = await service.updateRole('u1', { role: 'admin' });

      expect(result).toEqual({
        id: 'u1',
        email: 'a@b.com',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('throws NotFoundException when role name is unknown', async () => {
      db.query.roles.findFirst.mockResolvedValue(null);

      await expect(
        service.updateRole('u1', { role: 'unknown' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when user id is not found', async () => {
      db.query.roles.findFirst.mockResolvedValue({
        id: 'role-uuid',
        name: 'admin',
      });
      setupUpdateChain([]);

      await expect(
        service.updateRole('nonexistent', { role: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('returns the created UserDto when the email is free', async () => {
      db.query.users.findFirst.mockResolvedValue(null);
      db.query.roles.findFirst.mockResolvedValue({
        id: 'role-uuid',
        name: 'user',
      });
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: 'u3',
              email: 'new@example.com',
              createdAt: new Date('2024-01-03'),
            },
          ]),
        }),
      });

      const result = await service.create({
        email: 'new@example.com',
        password: 'Password1!',
        role: 'user',
      });

      expect(result).toEqual({
        id: 'u3',
        email: 'new@example.com',
        role: 'user',
        createdAt: new Date('2024-01-03'),
      });
    }, 30_000);

    it('throws ConflictException when the email is already in use', async () => {
      db.query.users.findFirst.mockResolvedValue({
        id: 'existing',
        email: 'new@example.com',
      });

      await expect(
        service.create({
          email: 'new@example.com',
          password: 'Password1!',
          role: 'user',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateEmail', () => {
    const setupUpdateChain = (returning: unknown[]) => {
      const returningMock = jest.fn().mockResolvedValue(returning);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      db.update.mockReturnValue({ set: setMock });
    };

    it('returns the updated UserDto on success', async () => {
      db.query.users.findFirst.mockResolvedValue(null);
      db.query.roles.findFirst.mockResolvedValue({
        id: 'role-uuid',
        name: 'user',
      });
      setupUpdateChain([
        {
          id: 'u1',
          email: 'updated@example.com',
          createdAt: new Date('2024-01-01'),
          roleId: 'role-uuid',
        },
      ]);

      const result = await service.updateEmail('u1', {
        email: 'updated@example.com',
      });

      expect(result).toEqual({
        id: 'u1',
        email: 'updated@example.com',
        role: 'user',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('throws ConflictException when the email is used by another user', async () => {
      db.query.users.findFirst.mockResolvedValue({
        id: 'other-user',
        email: 'updated@example.com',
      });

      await expect(
        service.updateEmail('u1', { email: 'updated@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when the user id does not exist', async () => {
      db.query.users.findFirst.mockResolvedValue(null);
      setupUpdateChain([]);

      await expect(
        service.updateEmail('nonexistent', { email: 'updated@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const setupDeleteChain = (returning: unknown[]) => {
      const returningMock = jest.fn().mockResolvedValue(returning);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      db.delete.mockReturnValue({ where: whereMock });
    };

    it('deletes the user when not deleting the caller themselves', async () => {
      setupDeleteChain([{ id: 'u1' }]);

      await service.remove('u1', 'caller-uuid');

      expect(db.delete).toHaveBeenCalled();
    });

    it('throws ForbiddenException when a superuser tries to delete themselves', async () => {
      await expect(
        service.remove('caller-uuid', 'caller-uuid'),
      ).rejects.toThrow(ForbiddenException);
      expect(db.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user id does not exist', async () => {
      setupDeleteChain([]);

      await expect(
        service.remove('nonexistent', 'caller-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
