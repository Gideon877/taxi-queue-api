import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { queueRouteTable, queueTable, taxiRouteTable } from 'src/db/schema';
import { TaxiRoutesService } from 'src/taxi_routes/taxi_routes.service';
import { QueueConstants } from 'src/utils';
import { QueueField } from 'src/utils/enums';

@Injectable()
export class QueuesService {
    constructor(private readonly taxiRoutesService: TaxiRoutesService) { }

    async getAllQueues() {
        return await db.select().from(queueTable);
    }

    /**
     * Get fare by queueId.
     * @param queueId - The ID of the queue to fetch fare details.
     * @returns The fare information, including details from related tables.
     */
    async getFareByQueueId(queueId: number) {
        const result = await db
            .select({
                queueId: queueRouteTable.queueId,
                fare: taxiRouteTable.fare,
                fromRankId: taxiRouteTable.fromRankId,
                toRankId: taxiRouteTable.toRankId,
            })
            .from(queueRouteTable)
            .innerJoin(taxiRouteTable, eq(queueRouteTable.taxiRouteId, taxiRouteTable.id))
            .where(eq(queueRouteTable.queueId, queueId))
            .execute();

        if (result.length === 0) {
            throw new Error(`No fare found for queueId: ${queueId}`);
        }

        return result[0];
    }


    async getQueueById(id: number) {
        const queue = await db
            .select()
            .from(queueTable)
            .where(eq(queueTable.id, id))
            .execute();

        if (queue.length === 0) {
            throw new NotFoundException(`Queue with ID ${id} not found`);
        }
        const queueInfo = await this.getFareByQueueId(id);

        return { ...queue[0], fare: queueInfo.fare };
    }

    async getQueuesForRoute(routeId: number) {
        const queuesForRoute = await db
            .select()
            .from(queueTable)
            .innerJoin(queueRouteTable, eq(queueTable.id, queueRouteTable.queueId))
            .where(eq(queueRouteTable.taxiRouteId, routeId))
            .execute();


        return queuesForRoute
    }

    async updateQueueCount(queueId: number, field: QueueField, count: number) {

        const result = await db
            .update(queueTable)
            .set({
                [field]: count,
            })
            .where(eq(queueTable.id, queueId))
            .execute();

        if (result.rowCount === 0) {
            return { message: `Queue with id ${queueId} not found or not updated.` };
        }

        return {
            message: `${field.replace('_', ' ').toUpperCase()} updated successfully.`,
            updatedCount: count
        };
    }

    async onDeparture(queueId: number): Promise<any> {

        try {
            const currentQueue = await db
                .select()
                .from(queueTable)
                .where(eq(queueTable.id, queueId))
                .execute();

            if (currentQueue.length === 0) {
                throw new Error("Queue not found");
            }

            const { passengerQueueCount, taxiQueueCount } = currentQueue[0];

            if (passengerQueueCount >= QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE && taxiQueueCount > 0) {
                await db.update(queueTable)
                    .set({
                        passengerQueueCount: sql`${queueTable.passengerQueueCount} - ${QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE}`,
                        taxiQueueCount: sql`${queueTable.taxiQueueCount} - 1`,
                        taxiDepartedCount: sql`${queueTable.taxiDepartedCount} + 1`,
                    })
                    .where(eq(queueTable.id, queueId))
                    .execute();
            } else {
                throw new Error("Not enough passengers or no taxis available for departure");
            }

        } catch (error) {
            console.log(error);
            return {
                message: error.message,
            }
        }
    }

    async createQueue() {
        const newQueue = await db
            .insert(queueTable)
            .values({
                passengerQueueCount: 0,
                taxiQueueCount: 0,
                taxiDepartedCount: 0,
            })
            .returning()
            .execute();

        return newQueue[0]
    }


    // TODO: To be implemented for each rank to have new queue every day
    // async getOrCreateTodayQueue() {
    //     const todayDate = moment().format('YYYY-MM-DD');
    //     const existingQueue = await db
    //         .select()
    //         .from(queueTable)
    //         .where(
    //             eq(
    //                 sql`(created_at::date)`,
    //                 sql`${todayDate}`
    //             )
    //         )
    //         .execute();

    //     if (existingQueue.length === 0) {
    //         const newQueue = await db
    //             .insert(queueTable)
    //             .values({
    //                 passengerQueueCount: 0,
    //                 taxiQueueCount: 0,
    //                 taxiDepartedCount: 0,
    //             })
    //             .returning()
    //             .execute();

    //         return newQueue[0];
    //     }
    //     return existingQueue[0];
    // }
}