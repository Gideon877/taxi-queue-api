import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { RanksModule } from 'src/ranks/ranks.module';
import { QueuesModule } from 'src/queues/queues.module';
import { TaxiRoutesModule } from 'src/taxi_routes/taxi_routes.module';

@Module({
    imports: [RanksModule, QueuesModule, TaxiRoutesModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
