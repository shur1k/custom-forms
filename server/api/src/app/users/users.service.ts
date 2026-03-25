import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB, DrizzleDB } from '../drizzle/drizzle.module';
import { users, roles } from '../../db/schema';
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
      .returning({ id: users.id, email: users.email, createdAt: users.createdAt });

    if (!updated) throw new NotFoundException(`User '${id}' not found`);

    return { ...updated, role: dto.role };
  }
}
