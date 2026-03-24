import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DRIZZLE_DB, DrizzleDB } from '../drizzle/drizzle.module';
import { users, roles } from '../../db/schema';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
    if (existing) throw new ConflictException('Email already in use');

    const userRole = await this.db.query.roles.findFirst({
      where: eq(roles.name, 'user'),
    });
    if (!userRole) throw new Error('Default role not found — run db:seed');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const [newUser] = await this.db
      .insert(users)
      .values({ email: dto.email, passwordHash, roleId: userRole.id })
      .returning({ id: users.id, email: users.email });

    return { accessToken: this.jwtService.sign({ sub: newUser.id, email: newUser.email, role: userRole.name }) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
      with: { role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role.name,
      }),
    };
  }
}
