// import { sql } from 'drizzle-orm';
import { integer, pgTable, timestamp, text } from 'drizzle-orm/pg-core';

export const rankTable = pgTable("rank", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    rankName: text().notNull(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow(). $onUpdateFn(() => new Date()),
})

export const taxiRouteTable = pgTable("route", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    fare: integer().notNull().default(0),
    fromRankId: integer().notNull().references(()=> rankTable.id, {onDelete: 'cascade'}),
    toRankId: integer().notNull().references(()=> rankTable.id, {onDelete: 'cascade'}),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
})

export const queueTable = pgTable("queue", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    passengerQueueCount: integer().default(0).notNull(),
    taxiQueueCount: integer().default(0).notNull(),
    taxiDepartedCount: integer().default(0).notNull(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
});

export const queueRouteTable = pgTable("queue_route", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    queueId: integer().references(() => queueTable.id, { onDelete: 'cascade' }).notNull(),
    taxiRouteId: integer().references(() => taxiRouteTable.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
});
