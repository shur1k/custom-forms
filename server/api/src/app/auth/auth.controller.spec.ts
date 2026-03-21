import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('delegates register() to AuthService', async () => {
    mockAuthService.register.mockResolvedValue({ accessToken: 'tok' });
    const dto = { email: 'a@b.com', password: 'Pass1234!' };

    const result = await controller.register(dto);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ accessToken: 'tok' });
  });

  it('delegates login() to AuthService', async () => {
    mockAuthService.login.mockResolvedValue({ accessToken: 'tok' });
    const dto = { email: 'a@b.com', password: 'Pass1234!' };

    const result = await controller.login(dto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ accessToken: 'tok' });
  });
});
