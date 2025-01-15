import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { QueuesModule } from './queues/queues.module';
import { QueuesController } from './queues/queues.controller';
import { QueuesService } from './queues/queues.service';
import { RanksModule } from './ranks/ranks.module';

config();

@Module({
	imports: [QueuesModule, RanksModule],
	controllers: [
		QueuesController
	],
	providers: [
		QueuesService
	],
})
export class AppModule { }
