import { Injectable } from '@nestjs/common';
import { QueuesService } from 'src/queues/queues.service';
import { RanksService } from 'src/ranks/ranks.service';
import { TaxiRoutesService } from 'src/taxi_routes/taxi_routes.service';

@Injectable()
export class StatsService {

    constructor(
        private readonly rankService: RanksService,
        private readonly queueService: QueuesService,
        private readonly taxiRoutesService: TaxiRoutesService
    ) {}

    async getStats() {
        const totalRanks = await this.rankService.getTotalRanks();
        const totalRoutes = await this.taxiRoutesService.getTotalRoutes();
        const totalQueues = await this.queueService.getTotalQueues();
        const totalPassengers = await this.taxiRoutesService.getTotalPassengers();
        const totalDepartures = await this.taxiRoutesService.getTotalTaxiDepartures();
        const averageFare = await this.taxiRoutesService.getAverageFare();

        return {
            totalRanks,
            totalRoutes,
            totalQueues,
            totalPassengers,
            totalDepartures,
            averageFare,
        };
    }

    async getDetailedStats() {
        const highestFareRoutes = await this.taxiRoutesService.getRoutesWithHighestFare();
        const frequentRoutes = await this.taxiRoutesService.getMostFrequentRoutes();
        const queuesWithMostDepartures = await this.taxiRoutesService.getQueuesWithMostDepartures();
        const fareByFromRank = await this.taxiRoutesService.getTotalFareByFromRank();

        return {
            highestFareRoutes,
            frequentRoutes,
            queuesWithMostDepartures,
            fareByFromRank,
        };
    }
}
