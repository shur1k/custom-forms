import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FormsDataController } from './forms-data.controller';
import { FormsDataService } from './forms-data.service';
import { SchemasService } from '../schemas/schemas.service';

const SCHEMA_ID = 'schema-uuid';
const USER_ID = 'user-uuid';
const mockReq = { user: { userId: USER_ID, role: 'user' } };

const publishedSchema = {
  id: SCHEMA_ID,
  schema: {
    properties: { name: { type: 'string', title: 'Name' } },
    required: ['name'],
  },
};

const mockFormsDataService = {
  getOwn: jest.fn(),
  submit: jest.fn(),
  deleteOwn: jest.fn(),
};

const mockSchemasService = {
  findPublishedById: jest.fn(),
};

describe('FormsDataController', () => {
  let controller: FormsDataController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [FormsDataController],
      providers: [
        { provide: FormsDataService, useValue: mockFormsDataService },
        { provide: SchemasService, useValue: mockSchemasService },
      ],
    })
      .overrideGuard(require('../auth/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(FormsDataController);
    jest.clearAllMocks();
  });

  // ── get ─────────────────────────────────────────────────────────────────
  describe('get', () => {
    it('404s when the form is not published (AC-14)', async () => {
      mockSchemasService.findPublishedById.mockRejectedValue(
        new NotFoundException(),
      );
      await expect(controller.get(SCHEMA_ID, mockReq)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockFormsDataService.getOwn).not.toHaveBeenCalled();
    });

    it("prefills with the caller's own values (AC-19), never a caller-supplied userId", async () => {
      mockSchemasService.findPublishedById.mockResolvedValue(publishedSchema);
      mockFormsDataService.getOwn.mockResolvedValue({
        values: { name: 'Alice' },
      });

      const result = await controller.get(SCHEMA_ID, mockReq);

      expect(mockFormsDataService.getOwn).toHaveBeenCalledWith(
        SCHEMA_ID,
        USER_ID,
      );
      expect(result.values).toEqual({ name: 'Alice' });
    });

    it('returns null values when the caller has no prior submission', async () => {
      mockSchemasService.findPublishedById.mockResolvedValue(publishedSchema);
      mockFormsDataService.getOwn.mockResolvedValue(undefined);

      const result = await controller.get(SCHEMA_ID, mockReq);

      expect(result.values).toBeNull();
    });
  });

  // ── submit ──────────────────────────────────────────────────────────────
  describe('submit', () => {
    it('404s when the form is not published (AC-14)', async () => {
      mockSchemasService.findPublishedById.mockRejectedValue(
        new NotFoundException(),
      );
      await expect(
        controller.submit(SCHEMA_ID, { values: { name: 'Alice' } }, mockReq),
      ).rejects.toThrow(NotFoundException);
      expect(mockFormsDataService.submit).not.toHaveBeenCalled();
    });

    it('blocks a submit with a missing required field and saves nothing (AC-18)', async () => {
      mockSchemasService.findPublishedById.mockResolvedValue(publishedSchema);

      await expect(
        controller.submit(SCHEMA_ID, { values: {} }, mockReq),
      ).rejects.toThrow(BadRequestException);
      expect(mockFormsDataService.submit).not.toHaveBeenCalled();
    });

    it('submits with req.user.userId, never a body-supplied userId (AC-17/AC-20)', async () => {
      mockSchemasService.findPublishedById.mockResolvedValue(publishedSchema);
      mockFormsDataService.submit.mockResolvedValue({
        values: { name: 'Alice' },
      });

      await controller.submit(
        SCHEMA_ID,
        { values: { name: 'Alice' } },
        mockReq,
      );

      expect(mockFormsDataService.submit).toHaveBeenCalledWith(
        SCHEMA_ID,
        USER_ID,
        {
          name: 'Alice',
        },
      );
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────
  describe('remove', () => {
    it("deletes the caller's own data via req.user.userId (AC-29)", async () => {
      mockFormsDataService.deleteOwn.mockResolvedValue(undefined);

      await controller.remove(SCHEMA_ID, mockReq);

      expect(mockFormsDataService.deleteOwn).toHaveBeenCalledWith(
        SCHEMA_ID,
        USER_ID,
      );
    });
  });
});
