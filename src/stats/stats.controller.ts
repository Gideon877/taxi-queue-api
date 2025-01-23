import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get()
    async getStats() {
        const stats = await this.statsService.getStats();
        return stats;
    }

    @Get('detailed')
    async getDetailedStats() {
        const stats = await this.statsService.getDetailedStats();
        return stats;
    }
}
