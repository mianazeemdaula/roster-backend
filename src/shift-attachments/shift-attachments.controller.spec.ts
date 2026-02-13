import { Test, TestingModule } from '@nestjs/testing';
import { ShiftAttachmentsController } from './shift-attachments.controller';
import { ShiftAttachmentsService } from './shift-attachments.service';

describe('ShiftAttachmentsController', () => {
    let controller: ShiftAttachmentsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShiftAttachmentsController],
            providers: [ShiftAttachmentsService],
        }).compile();

        controller = module.get<ShiftAttachmentsController>(
            ShiftAttachmentsController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
