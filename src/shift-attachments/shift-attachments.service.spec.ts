import { Test, TestingModule } from '@nestjs/testing';
import { ShiftAttachmentsService } from './shift-attachments.service';

describe('ShiftAttachmentsService', () => {
    let service: ShiftAttachmentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ShiftAttachmentsService],
        }).compile();

        service = module.get<ShiftAttachmentsService>(ShiftAttachmentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
