import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { QueuesModule } from './queues/queues.module';
import { QueuesController } from './queues/queues.controller';
import { QueuesService } from './queues/queues.service';
import { RanksModule } from './ranks/ranks.module';
import { TaxiRoutesModule } from './taxi_routes/taxi_routes.module';

config();

@Module({
	imports: [QueuesModule, RanksModule, TaxiRoutesModule],
	controllers: [
		QueuesController
	],
	providers: [
		QueuesService
	],
})
export class AppModule { }
