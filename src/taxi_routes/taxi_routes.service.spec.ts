import { Test, TestingModule } from '@nestjs/testing';
import { TaxiRoutesService } from './taxi_routes.service';

describe('TaxiRoutesService', () => {
  let service: TaxiRoutesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxiRoutesService],
    }).compile();

    service = module.get<TaxiRoutesService>(TaxiRoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
