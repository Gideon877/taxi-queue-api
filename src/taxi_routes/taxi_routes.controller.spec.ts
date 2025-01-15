import { Test, TestingModule } from '@nestjs/testing';
import { TaxiRoutesController } from './taxi_routes.controller';
import { TaxiRoutesService } from './taxi_routes.service';

describe('TaxiRoutesController', () => {
  let controller: TaxiRoutesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxiRoutesController],
      providers: [TaxiRoutesService],
    }).compile();

    controller = module.get<TaxiRoutesController>(TaxiRoutesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
