import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { QueuesController } from './queues.controller';
import { TaxiRoutesModule } from 'src/taxi_routes/taxi_routes.module';

@Module({
    imports: [TaxiRoutesModule],
    providers: [QueuesService],
    controllers: [QueuesController]
})
export class QueuesModule { }
