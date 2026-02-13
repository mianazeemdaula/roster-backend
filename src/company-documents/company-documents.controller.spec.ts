import { Test, TestingModule } from '@nestjs/testing';
import { CompanyDocumentsController } from './company-documents.controller';
import { CompanyDocumentsService } from './company-documents.service';

describe('CompanyDocumentsController', () => {
    let controller: CompanyDocumentsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CompanyDocumentsController],
            providers: [CompanyDocumentsService],
        }).compile();

        controller = module.get<CompanyDocumentsController>(
            CompanyDocumentsController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
