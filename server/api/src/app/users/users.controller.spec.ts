import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';

const mockUsersService = {
  findAll: jest.fn(),
  updateRole: jest.fn(),
};

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
});
