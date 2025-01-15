import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import * as moment from "moment";
import { db } from 'src/db';
import { queueRouteTable, queueTable } from 'src/db/schema';
import { TaxiRoutesService } from 'src/taxi_routes/taxi_routes.service';
import { currentTimeStamp, QueueConstants } from 'src/utils';
import { QueueField } from 'src/utils/enums';

@Injectable()
export class QueuesService {
    constructor(private readonly taxiRoutesService: TaxiRoutesService) { }

    async getAllQueues() {
        return await db.select().from(queueTable);
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
        const updatedAt = currentTimeStamp()
        console.log({ queueId, field, count })

        const result = await db
            .update(queueTable)
            .set({
                [field]: count,
                updated_at: updatedAt,
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

    // async onDeparture(queueId: number): Promise<any> {

    //     try {
    //         const currentQueue = await db
    //             .select()
    //             .from(queueTable)
    //             .where(eq(queueTable.id, queueId))
    //             .execute();

    //         if (currentQueue.length === 0) {
    //             throw new Error("Queue not found");
    //         }

    //         const { passengerQueueCount, taxiQueueCount } = currentQueue[0];

    //         console.log( { passengerQueueCount, taxiQueueCount })

    //         if (passengerQueueCount >= QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE && taxiQueueCount > 0) {
    //             await db.update(queueTable)
    //                 .set({
    //                     passengerQueueCount: sql`${queueTable.passengerQueueCount} - ${QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE}`,
    //                     taxiQueueCount: sql`${queueTable.taxiQueueCount} - 1`,
    //                     taxiDepartedCount: sql`${queueTable.taxiDepartedCount} + 1`,
    //                     updated_at: currentTimeStamp(),
    //                 })
    //                 .where(eq(queueTable.id, queueId))
    //                 .execute();
    //         } else {
    //             throw new Error("Not enough passengers or no taxis available for departure");
    //         }

    //     } catch (error) {
    //         console.log(error);
    //         return {
    //             message: error.message,
    //         }
    //     }

    // }

    async  processTaxiDeparture(routeId: number) {
        // Retrieve route along with queue info
        const route = await this.taxiRoutesService.getRouteWithQueueInfo(routeId);
    
        if (!route) {
            throw new Error(`Route with ID ${routeId} not found`);
        }
    
        // Assuming route.queues is an object with 'fromQueue' and 'toQueue'
        const { queues } = route; 


        console.log(queues)

        // const fromQueue = queues?.fromQueue;
        // const toQueue = queues?.toQueue;
    
        // // Validate if fromQueue and toQueue exist
        // if (!fromQueue || !toQueue) {
        //     throw new Error('Queue information is missing');
        // }
    
        // // Check if there are enough passengers in the departure queue
        // if (fromQueue.passengerQueueCount < QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE) {
        //     throw new Error('Not enough passengers in the departure queue');
        // }
    
        // // Update the 'fromQueue' by reducing passengers and taxi count, and increasing departed count
        // await db.update(queueTable)
        //     .set({
        //         passengerQueueCount: sql`${queueTable.passengerQueueCount} - ${QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE}`,
        //         taxiQueueCount: sql`${queueTable.taxiQueueCount} - 1`,
        //         taxiDepartedCount: sql`${queueTable.taxiDepartedCount} + 1`,
        //     })
        //     .where(eq(queueTable.id, fromQueue.id))  // Use 'fromQueue.id' which is obtained from the route
        //     .execute();
    
        // // Update the 'toQueue' by adding passengers from the 'fromQueue'
        // await db.update(queueTable)
        //     .set({
        //         passengerQueueCount: sql`${queueTable.passengerQueueCount} + ${QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE}`,
        //     })
        //     .where(eq(queueTable.id, toQueue.id))  // Use 'toQueue.id' which is obtained from the route
        //     .execute();
    
        return { message: 'Taxi departure processed successfully' };
    }
    

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