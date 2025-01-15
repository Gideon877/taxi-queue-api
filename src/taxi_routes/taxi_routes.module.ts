import { Module } from '@nestjs/common';
import { TaxiRoutesService } from './taxi_routes.service';
import { TaxiRoutesController } from './taxi_routes.controller';

@Module({
    controllers: [TaxiRoutesController],
    providers: [TaxiRoutesService],
    exports: [TaxiRoutesService],
})
export class TaxiRoutesModule { }
