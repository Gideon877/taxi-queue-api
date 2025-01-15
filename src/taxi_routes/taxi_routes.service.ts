import { Injectable } from '@nestjs/common';
import { CreateTaxiRouteDto } from './dto/create-taxi_route.dto';
// import { UpdateTaxiRouteDto } from './dto/update-taxi_route.dto';
import { taxiRouteTable, rankTable, queueTable, queueRouteTable } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { db } from 'src/db';

@Injectable()
export class TaxiRoutesService {

    async addRoute(createTaxiRouteDto: CreateTaxiRouteDto) {
        const newRoute = await db
            .insert(taxiRouteTable)
            .values(createTaxiRouteDto)
            .returning();

        return newRoute[0];
    }


    async getRoutesByRankId(rankId: number) {
        const routes = await db
            .select({
                id: taxiRouteTable.id,
                fare: taxiRouteTable.fare,
                fromRankId: taxiRouteTable.fromRankId,
                toRankId: taxiRouteTable.toRankId,
                toRankName: rankTable.rankName,    
            })
            .from(taxiRouteTable)
            .leftJoin(rankTable, eq(taxiRouteTable.toRankId, rankTable.id))    
            .where(or(
                eq(taxiRouteTable.fromRankId, rankId),
                eq(taxiRouteTable.toRankId, rankId)
            ))
            .execute();

        return routes;
    }

    // async getRoutesByRankId(rankId: number) {
    //     const routes = await db
    //         .select()
    //         .from(taxiRouteTable)
    //         .where(or(
    //             eq(taxiRouteTable.fromRankId, rankId),
    //             eq(taxiRouteTable.toRankId, rankId)
    //         ))
    //         .execute();

    //     return routes;
    // }


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
}
