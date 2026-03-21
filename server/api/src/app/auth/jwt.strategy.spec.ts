import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env['JWT_SECRET'] = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('returns user object when payload has sub', () => {
    const result = strategy.validate({ sub: 'user-uuid', email: 'a@b.com' });
    expect(result).toEqual({ userId: 'user-uuid', email: 'a@b.com' });
  });

  it('throws UnauthorizedException when sub is missing', () => {
    expect(() => strategy.validate({ sub: '', email: 'a@b.com' }))
      .toThrow(UnauthorizedException);
  });
});
