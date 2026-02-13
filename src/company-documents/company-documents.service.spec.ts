import { Test, TestingModule } from '@nestjs/testing';
import { CompanyDocumentsService } from './company-documents.service';

describe('CompanyDocumentsService', () => {
    let service: CompanyDocumentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CompanyDocumentsService],
        }).compile();

        service = module.get<CompanyDocumentsService>(CompanyDocumentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
