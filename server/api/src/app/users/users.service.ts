import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { roles,users } from '../../db/schema';
import { DRIZZLE_DB, DrizzleDB } from '../drizzle/drizzle.module';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateEmailDto } from './dto/update-email.dto';
import type { UpdateRoleDto } from './dto/update-role.dto';

export interface UserDto {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  async findAll(): Promise<UserDto[]> {
    const rows = await this.db.query.users.findMany({ with: { role: true } });
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role.name,
      createdAt: u.createdAt,
    }));
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<UserDto> {
    const role = await this.db.query.roles.findFirst({
      where: eq(roles.name, dto.role),
    });
    if (!role) throw new NotFoundException(`Role '${dto.role}' not found`);

    const [updated] = await this.db
      .update(users)
      .set({ roleId: role.id, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
      });

    if (!updated) throw new NotFoundException(`User '${id}' not found`);

    return { ...updated, role: dto.role };
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
    if (existing) throw new ConflictException('Email already in use');

    const role = await this.db.query.roles.findFirst({
      where: eq(roles.name, dto.role),
    });
    if (!role) throw new NotFoundException(`Role '${dto.role}' not found`);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const [created] = await this.db
      .insert(users)
      .values({ email: dto.email, passwordHash, roleId: role.id })
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
      });

    return { ...created, role: dto.role };
  }

  async updateEmail(id: string, dto: UpdateEmailDto): Promise<UserDto> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
    if (existing && existing.id !== id)
      throw new ConflictException('Email already in use');

    const [updated] = await this.db
      .update(users)
      .set({ email: dto.email, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`User '${id}' not found`);

    const role = await this.db.query.roles.findFirst({
      where: eq(roles.id, updated.roleId),
    });

    return {
      id: updated.id,
      email: updated.email,
      role: role!.name,
      createdAt: updated.createdAt,
    };
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const [deleted] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) throw new NotFoundException(`User '${id}' not found`);
  }
}
