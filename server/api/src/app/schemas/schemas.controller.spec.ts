import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { SchemasController } from './schemas.controller';
import { SchemasService } from './schemas.service';

const SCHEMA_ID = 'schema-uuid';
const USER_ID   = 'user-uuid';
const mockReq   = { user: { userId: USER_ID } };

const mockSchemasService = {
  findAll:      jest.fn(),
  findOne:      jest.fn(),
  create:       jest.fn(),
  update:       jest.fn(),
  remove:       jest.fn(),
  publish:      jest.fn(),
  findVersions: jest.fn(),
};

describe('SchemasController', () => {
  let controller: SchemasController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [SchemasController],
      providers: [{ provide: SchemasService, useValue: mockSchemasService }],
    })
      .overrideGuard(require('../auth/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(SchemasController);
    jest.clearAllMocks();
  });

  it('findAll passes numeric page and limit to service', () => {
    mockSchemasService.findAll.mockResolvedValue([]);
    controller.findAll(2, 5);
    expect(mockSchemasService.findAll).toHaveBeenCalledWith(2, 5);
  });

  it('findOne delegates to service', () => {
    mockSchemasService.findOne.mockResolvedValue({ id: SCHEMA_ID });
    controller.findOne(SCHEMA_ID);
    expect(mockSchemasService.findOne).toHaveBeenCalledWith(SCHEMA_ID);
  });

  it('create passes dto and userId to service', () => {
    const dto = { title: 'Form', type: 'form' as const };
    mockSchemasService.create.mockResolvedValue({ id: SCHEMA_ID });
    controller.create(dto, mockReq);
    expect(mockSchemasService.create).toHaveBeenCalledWith(dto, USER_ID);
  });

  it('update passes id, dto and userId to service', () => {
    const dto = { title: 'Updated' };
    mockSchemasService.update.mockResolvedValue({ id: SCHEMA_ID });
    controller.update(SCHEMA_ID, dto, mockReq);
    expect(mockSchemasService.update).toHaveBeenCalledWith(SCHEMA_ID, dto, USER_ID);
  });

  it('remove passes id and userId to service', () => {
    mockSchemasService.remove.mockResolvedValue(undefined);
    controller.remove(SCHEMA_ID, mockReq);
    expect(mockSchemasService.remove).toHaveBeenCalledWith(SCHEMA_ID, USER_ID);
  });

  it('publish passes id and userId to service', () => {
    mockSchemasService.publish.mockResolvedValue({ version: 'v1' });
    controller.publish(SCHEMA_ID, mockReq);
    expect(mockSchemasService.publish).toHaveBeenCalledWith(SCHEMA_ID, USER_ID);
  });

  it('findVersions delegates to service', () => {
    mockSchemasService.findVersions.mockResolvedValue([]);
    controller.findVersions(SCHEMA_ID);
    expect(mockSchemasService.findVersions).toHaveBeenCalledWith(SCHEMA_ID);
  });
});
