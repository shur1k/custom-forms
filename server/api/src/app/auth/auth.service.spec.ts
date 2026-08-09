import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { DRIZZLE_DB } from '../drizzle/drizzle.module';

const mockDb = () => ({
  query: {
    users: { findFirst: jest.fn() },
    roles: { findFirst: jest.fn() },
  },
  insert: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let db: ReturnType<typeof mockDb>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    db = mockDb();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DRIZZLE_DB, useValue: db },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('returns an accessToken when registration succeeds', async () => {
      db.query.users.findFirst.mockResolvedValue(null);
      db.query.roles.findFirst.mockResolvedValue({
        id: 'role-uuid',
        name: 'user',
      });
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest
            .fn()
            .mockResolvedValue([{ id: 'user-uuid', email: 'a@b.com' }]),
        }),
      });

      const result = await service.register({
        email: 'a@b.com',
        password: 'Pass1234!',
      });

      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-uuid',
        email: 'a@b.com',
        role: 'user',
      });
    }, 30_000);

    it('throws ConflictException when email already exists', async () => {
      db.query.users.findFirst.mockResolvedValue({
        id: 'existing',
        email: 'a@b.com',
      });

      await expect(
        service.register({ email: 'a@b.com', password: 'Pass1234!' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws an error when default role is not seeded', async () => {
      db.query.users.findFirst.mockResolvedValue(null);
      db.query.roles.findFirst.mockResolvedValue(null);

      await expect(
        service.register({ email: 'a@b.com', password: 'Pass1234!' }),
      ).rejects.toThrow('Default role not found');
    });
  });

  describe('login', () => {
    it('returns an accessToken when credentials are valid', async () => {
      const hash = await bcrypt.hash('Pass1234!', 1);
      db.query.users.findFirst.mockResolvedValue({
        id: 'user-uuid',
        email: 'a@b.com',
        passwordHash: hash,
        role: { name: 'user' },
      });

      const result = await service.login({
        email: 'a@b.com',
        password: 'Pass1234!',
      });

      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-uuid',
        email: 'a@b.com',
        role: 'user',
      });
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      db.query.users.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@b.com', password: 'Pass1234!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      const hash = await bcrypt.hash('CorrectPass!', 1);
      db.query.users.findFirst.mockResolvedValue({
        id: 'user-uuid',
        email: 'a@b.com',
        passwordHash: hash,
        role: { name: 'user' },
      });

      await expect(
        service.login({ email: 'a@b.com', password: 'WrongPass!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
