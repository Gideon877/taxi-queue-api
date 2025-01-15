import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { QueueField } from 'src/utils/enums';

@Controller('queues')
export class QueuesController {
    constructor(private readonly queuesService: QueuesService) { }

    @Get()
    async getAllQueues() {
        return await this.queuesService.getAllQueues();
    }

    @Get('today')
    async getTodayQueue() {
        return await this.queuesService.getOrCreateTodayQueue();
    }

    @Put()
    async updateQueueCount(@Body() { queueId, count, field }: { queueId: number, count: number, field: QueueField }) {
        return await this.queuesService.updateQueueCount(queueId, field, count);
    }

    @Put('departure/:queueId')
    async onDeparture(@Param('queueId') queueId: number) {
        return await this.queuesService.onDeparture(queueId);
    }
}
