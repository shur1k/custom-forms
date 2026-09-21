import { Test } from '@nestjs/testing';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import 'reflect-metadata';

const mockUsersService = {
  findAll: jest.fn(),
  updateRole: jest.fn(),
  create: jest.fn(),
  updateEmail: jest.fn(),
  remove: jest.fn(),
};

const mockReq = { user: { userId: 'caller-uuid', role: 'superuser' } };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UsersController);
    jest.clearAllMocks();
  });

  it('findAll delegates to service', () => {
    mockUsersService.findAll.mockResolvedValue([]);
    controller.findAll();
    expect(mockUsersService.findAll).toHaveBeenCalled();
  });

  it('updateRole passes id and dto to service', () => {
    const dto = { role: 'admin' };
    mockUsersService.updateRole.mockResolvedValue({ id: 'u1', role: 'admin' });
    controller.updateRole('u1', dto);
    expect(mockUsersService.updateRole).toHaveBeenCalledWith('u1', dto);
  });

  it('create passes dto to service', () => {
    const dto = {
      email: 'new@example.com',
      password: 'Password1!',
      role: 'user',
    };
    mockUsersService.create.mockResolvedValue({
      id: 'u2',
      email: dto.email,
      role: 'user',
    });
    controller.create(dto);
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
  });

  it('updateEmail passes id and dto to service', () => {
    const dto = { email: 'updated@example.com' };
    mockUsersService.updateEmail.mockResolvedValue({
      id: 'u1',
      email: dto.email,
    });
    controller.updateEmail('u1', dto);
    expect(mockUsersService.updateEmail).toHaveBeenCalledWith('u1', dto);
  });

  it('remove passes id and the caller userId to service', () => {
    mockUsersService.remove.mockResolvedValue(undefined);
    controller.remove('u1', mockReq);
    expect(mockUsersService.remove).toHaveBeenCalledWith('u1', 'caller-uuid');
  });
});
