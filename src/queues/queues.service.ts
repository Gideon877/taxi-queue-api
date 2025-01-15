import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import * as moment from "moment";
import { db } from 'src/db';
import { queueTable } from 'src/db/schema';
import { currentTimeStamp, QueueConstants } from 'src/utils';
import { QueueField } from 'src/utils/enums';

@Injectable()
export class QueuesService {
    async getAllQueues() {
        return await db.select().from(queueTable);
    }

    async updateQueueCount(queueId: number, field: QueueField, count: number) {
        const updatedAt = currentTimeStamp()
        console.log({queueId, field, count})

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

            const { passenger_queue_count, taxi_queue_count } = currentQueue[0];

            console.log( { passenger_queue_count, taxi_queue_count })

            if (passenger_queue_count >= QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE && taxi_queue_count > 0) {
                await db.update(queueTable)
                    .set({
                        passenger_queue_count: sql`${queueTable.passenger_queue_count} - ${QueueConstants.MAX_TAXI_PASSENGERS_PER_RIDE}`,
                        taxi_queue_count: sql`${queueTable.taxi_queue_count} - 1`,
                        taxi_departed_count: sql`${queueTable.taxi_departed_count} + 1`,
                        updated_at: currentTimeStamp(),
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


    async getOrCreateTodayQueue() {
        const todayDate = moment().format('YYYY-MM-DD');
        const existingQueue = await db
            .select()
            .from(queueTable)
            .where(
                eq(
                    sql`(created_at::date)`,
                    sql`${todayDate}`
                )
            )
            .execute();

        if (existingQueue.length === 0) {
            const newQueue = await db
                .insert(queueTable)
                .values({
                    passenger_queue_count: 0,
                    taxi_queue_count: 0,
                    taxi_departed_count: 0,
                })
                .returning()
                .execute();

            return newQueue[0];
        }
        return existingQueue[0];
    }
}