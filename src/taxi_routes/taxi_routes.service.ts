import { Injectable } from '@nestjs/common';
import { CreateTaxiRouteDto } from './dto/create-taxi_route.dto';
import { taxiRouteTable, rankTable, queueTable, queueRouteTable, taxiRouteRelations, rankRelations } from '../db/schema';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { UpdateTaxiRouteDto } from './dto/update-taxi_route.dto';

@Injectable()
export class TaxiRoutesService {

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


        return newQueue
    }

    async addRoute(createTaxiRouteDto: CreateTaxiRouteDto) {
        const { fare, fromRankId, toRankId } = createTaxiRouteDto;

        const arrivalData = {
            fare,
            toRankId: fromRankId,
            fromRankId: toRankId,
        };

        // Check if departRoute already exists
        const existingDepartRoute = await db
            .select()
            .from(taxiRouteTable)
            .where(
                and(
                    eq(taxiRouteTable.fromRankId, fromRankId),
                    eq(taxiRouteTable.toRankId, toRankId)
                )
            )
            .execute();

        // Check if arrivalRoute already exists
        const existingArrivalRoute = await db
            .select()
            .from(taxiRouteTable)
            .where(
                and(
                    eq(taxiRouteTable.fromRankId, toRankId),
                    eq(taxiRouteTable.toRankId, fromRankId)
                )
            )
            .execute();

        let departRoute;
        if (existingDepartRoute.length === 0) {
            // Create departRoute if it doesn't exist
            const newDepartRoute = await db
                .insert(taxiRouteTable)
                .values(createTaxiRouteDto)
                .returning();
            departRoute = newDepartRoute[0];
        } else {
            departRoute = existingDepartRoute[0];
        }

        let arrivalRoute;
        if (existingArrivalRoute.length === 0) {
            // Create arrivalRoute if it doesn't exist
            const newArrivalRoute = await db
                .insert(taxiRouteTable)
                .values(arrivalData)
                .returning();
            arrivalRoute = newArrivalRoute[0];
        } else {
            arrivalRoute = existingArrivalRoute[0];
        }

        return {
            departRoute,
            arrivalRoute,
        };
    }


    async getRankName(rankId: number): Promise<string> {
        const result = await db
            .select({ toRankName: rankTable.rankName })
            .from(rankTable)
            .where(eq(rankTable.id, rankId))
            .execute();

        return result[0].toRankName
    }

    async onCreateRoute(createTaxiRouteDto: CreateTaxiRouteDto) {
        try {
            const routesData = await this.addRoute(createTaxiRouteDto);
            const arrivalQueue = await this.createQueue();
            const departQueue = await this.createQueue();

            const { arrivalRoute, departRoute } = routesData;

            const arrivalRouteId = arrivalRoute.id;
            const departRouteRankId = departRoute.toRankId;
            const arrivalQueueId = arrivalQueue[0].id;

            const departRouteId = departRoute.id;
            const departQueueId = departQueue[0].id;

            await this.createQueueForRoute(departQueueId, departRouteId);
            await this.createQueueForRoute(arrivalQueueId, arrivalRouteId);

            const toRankName = await this.getRankName(departRouteRankId)

            return {
                ...departRoute,
                toRankName
            }
        } catch (error) {
            console.error(error);
        }

    }


    async createQueueForRoute(queueId: number, taxiRouteId: number) {
        const newQueueRoute = await db
            .insert(queueRouteTable)
            .values({
                queueId,
                taxiRouteId,
            })
            .returning()
            .execute();

        return newQueueRoute[0]
    }

    async updateRoute(routeId: number, updateTaxiRouteDto: UpdateTaxiRouteDto) {
        const updatedRoute = await db
            .update(taxiRouteTable)
            .set({ fare: updateTaxiRouteDto.fare })
            .where(eq(taxiRouteTable.id, routeId))
            .returning();

        if (updatedRoute.length === 0) {
            throw new Error(`Route with ID ${routeId} not found`);
        }

        return updatedRoute[0]; // Return the updated route
    }

    async deleteRoute(routeId: number) {
        const deletedRoute = await db
            .delete(taxiRouteTable)
            .where(eq(taxiRouteTable.id, routeId))
            .returning();

        if (deletedRoute.length === 0) {
            throw new Error(`Route with ID ${routeId} not found`);
        }

        return deletedRoute[0]; // Return the deleted route
    }


    async getRoutesByRankId(rankId: number) {
        const routes = await db
            .select({
                id: taxiRouteTable.id,
                fare: taxiRouteTable.fare,
                fromRankId: taxiRouteTable.fromRankId,
                toRankId: taxiRouteTable.toRankId,
                toRankName: rankTable.rankName,
                queueId: queueRouteTable.queueId,
            })
            .from(taxiRouteTable)
            .leftJoin(rankTable, eq(taxiRouteTable.toRankId, rankTable.id)) // Join with rankTable for toRankName
            .leftJoin(queueRouteTable, eq(taxiRouteTable.id, queueRouteTable.taxiRouteId)) // Join with queueRouteTable for queueId
            .where(or(
                eq(taxiRouteTable.fromRankId, rankId),
                // eq(taxiRouteTable.toRankId, rankId)
            ))
            .execute();

        return routes;
    }

    async getRouteDetailsByQueueId(queueId: number) {
        const routeDetails = await db
            .select({
                routeId: taxiRouteTable.id,
                fare: taxiRouteTable.fare,
                fromRankName: rankTable.rankName,
                toRankName: sql`(SELECT "rankName" FROM ${rankTable} WHERE ${rankTable.id} = ${taxiRouteTable.toRankId})`.as('toRankName'),
                passengerQueueCount: queueTable.passengerQueueCount,
                taxiQueueCount: queueTable.taxiQueueCount,
                taxiDepartedCount: queueTable.taxiDepartedCount,
            })
            .from(queueRouteTable)
            .leftJoin(taxiRouteTable, eq(queueRouteTable.taxiRouteId, taxiRouteTable.id))
            .leftJoin(queueTable, eq(queueRouteTable.queueId, queueTable.id))
            .leftJoin(rankTable, eq(taxiRouteTable.fromRankId, rankTable.id))
            .where(eq(queueRouteTable.queueId, queueId))
            .execute();

        return routeDetails[0];
    }


    async getRouteWithQueueInfo(routeId: number) {
        const routeWithQueueInfo = await db
            .select({
                route: taxiRouteTable,
                fromRank: rankTable,
                toRank: rankTable,
                queues: queueTable,
            })
            .from(taxiRouteTable)
            .leftJoin(rankTable, eq(taxiRouteTable.fromRankId, rankTable.id))
            .leftJoin(rankTable, eq(taxiRouteTable.toRankId, rankTable.id))
            .leftJoin(queueRouteTable, eq(taxiRouteTable.id, queueRouteTable.taxiRouteId))
            .leftJoin(queueTable, eq(queueRouteTable.queueId, queueTable.id))
            .where(eq(taxiRouteTable.id, routeId))
            .execute();

        return routeWithQueueInfo[0];
    }


    async getRouteForQueue(queueId: number) {
        const routesForQueue = await db
            .select()
            .from(taxiRouteTable)
            .innerJoin(queueRouteTable, eq(taxiRouteTable.id, queueRouteTable.taxiRouteId))
            .where(eq(queueRouteTable.queueId, queueId))
            .execute();

        return routesForQueue;
    }

    // async getAllRoutes() {
    //     return db
    //         .select({
    //             id: taxiRouteTable.id,
    //             fare: taxiRouteTable.fare,
    //             fromRankId: taxiRouteTable.fromRankId,
    //             toRankId: taxiRouteTable.toRankId,
    //             fromRankName: rankTable.rankName.as('fromRankName'),
    //             toRankName: rankTable.rankName.as('toRankName'),
    //         })
    //         .from(taxiRouteTable)
    //         .leftJoin(rankTable, eq(taxiRouteTable.fromRankId, rankTable.id)) 
    //         .leftJoin(rankTable, eq(taxiRouteTable.toRankId, rankTable.id)); 
    // }


    async getTotalRoutes() {
        const result = await db
            .select({ total: sql`COUNT(*)` })
            .from(taxiRouteTable)
            .execute();
        return result[0].total;
    }

    async getRoutesWithHighestFare(limit = 5) {
        return db
            .select({
                id: taxiRouteTable.id,
                fare: taxiRouteTable.fare,
                fromRankId: taxiRouteTable.fromRankId,
                toRankId: taxiRouteTable.toRankId,
                fromRankName: sql`"fromRank"."rankName"`,
                toRankName: sql`"toRank"."rankName"`,
            })
            .from(taxiRouteTable)
            .leftJoin(sql`rank as "fromRank"`, eq(taxiRouteTable.fromRankId, sql`"fromRank".id`))
            .leftJoin(sql`rank as "toRank"`, eq(taxiRouteTable.toRankId, sql`"toRank".id`))
            .orderBy(desc(taxiRouteTable.fare))
            .limit(limit)
            .execute();
    }

    async getMostFrequentRoutes(limit = 5) {
        return db
            .select({
                taxiRouteId: queueRouteTable.taxiRouteId,
                routeCount: sql`COUNT(*)`,
                fromRankName: sql`"fromRank"."rankName"`,
                toRankName: sql`"toRank"."rankName"`,
            })
            .from(queueRouteTable)
            .leftJoin(taxiRouteTable, eq(queueRouteTable.taxiRouteId, taxiRouteTable.id))
            .leftJoin(sql`rank as "fromRank"`, eq(taxiRouteTable.fromRankId, sql`"fromRank".id`))
            .leftJoin(sql`rank as "toRank"`, eq(taxiRouteTable.toRankId, sql`"toRank".id`))
            .groupBy(
                queueRouteTable.taxiRouteId,
                sql`"fromRank"."rankName"`,
                sql`"toRank"."rankName"`
            )
            .orderBy(desc(sql`COUNT(*)`))
            .limit(limit)
            .execute();
    }


    async getTotalPassengers() {
        const result = await db
            .select({ totalPassengers: sql`SUM(${queueTable.passengerQueueCount})` })
            .from(queueTable)
            .execute();
        return result[0].totalPassengers;
    }

    async getAverageFare() {
        const result = await db
            .select({ averageFare: sql`AVG(${taxiRouteTable.fare})` })
            .from(taxiRouteTable)
            .execute();
        return result[0].averageFare;
    }

    async getTotalTaxiDepartures() {
        const result = await db
            .select({ totalDepartures: sql`SUM(${queueTable.taxiDepartedCount})` })
            .from(queueTable)
            .execute();
        return result[0].totalDepartures;
    }

    async getQueuesWithMostDepartures(limit = 5) {
        return db
            .select({
                id: queueTable.id,
                departures: queueTable.taxiDepartedCount,
                fromRankName: sql`(SELECT "rankName" FROM rank WHERE id = ${taxiRouteTable.fromRankId})`,
                toRankName: sql`(SELECT "rankName" FROM rank WHERE id = ${taxiRouteTable.toRankId})`,
            })
            .from(queueTable)
            .leftJoin(queueRouteTable, eq(queueTable.id, queueRouteTable.queueId))
            .leftJoin(taxiRouteTable, eq(queueRouteTable.taxiRouteId, taxiRouteTable.id))
            .groupBy(
                queueTable.id,
                taxiRouteTable.fromRankId,
                taxiRouteTable.toRankId
            )
            .orderBy(desc(queueTable.taxiDepartedCount))
            .limit(limit)
            .execute();
    }
    
    

    async getTotalFareByFromRank() {
        return db
            .select({
                fromRankId: taxiRouteTable.fromRankId,
                fromRankName: rankTable.rankName,
                totalFare: sql`SUM(${taxiRouteTable.fare})`,
            })
            .from(taxiRouteTable)
            .leftJoin(rankTable, eq(taxiRouteTable.fromRankId, rankTable.id))
            .groupBy(taxiRouteTable.fromRankId, rankTable.rankName)
            .execute();
    }

}
