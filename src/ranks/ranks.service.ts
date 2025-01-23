import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { rankTable } from '../db/schema'
import { db } from 'src/db';
import { eq, sql } from 'drizzle-orm';
import { capitalizeWords } from 'src/utils';

@Injectable()
export class RanksService {
    async create(createRankDto: CreateRankDto) {
        const rankName = capitalizeWords(createRankDto.rankName)
        const newRank = await db
            .insert(rankTable)
            .values({rankName})
            .returning();

        return newRank[0];
    }

    async findAll() {
        return await db.select().from(rankTable).execute();
    }

    async findOne(id: number) {
        const rank = await db
            .select()
            .from(rankTable)
            .where(eq(rankTable.id, id))
            .execute();

        if (rank.length === 0) {
            throw new NotFoundException(`Rank with ID ${id} not found`);
        }

        return rank[0];
    }

    async update(id: number, updateRankDto: UpdateRankDto) {
        const rankName = capitalizeWords(updateRankDto.rankName)
        const updatedRank = await db
            .update(rankTable)
            .set({ rankName })
            .where(eq(rankTable.id, id))
            .returning();

        if (updatedRank.length === 0) {
            throw new NotFoundException(`Rank with ID ${id} not found`);
        }

        return updatedRank[0];
    }

    async remove(id: number) {
        const deletedRank = await db
            .delete(rankTable)
            .where(eq(rankTable.id, id))
            .returning();

        if (deletedRank.length === 0) {
            throw new NotFoundException(`Rank with ID ${id} not found`);
        }

        return { message: `Rank with ID ${id} successfully deleted` };
    }

    async getTotalRanks() {
        const result = await db
            .select({ total: sql`COUNT(*)` })
            .from(rankTable)
            .execute();
        return result[0].total;
    }
}
