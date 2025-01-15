import { sql } from 'drizzle-orm';
import { integer, pgTable, timestamp, text } from 'drizzle-orm/pg-core';

export const queueTable = pgTable("queue", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    passenger_queue_count: integer().default(0).notNull(),
    taxi_queue_count: integer().default(0).notNull(),
    taxi_departed_count: integer().default(0).notNull(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow().$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
});


export const rankTable = pgTable("rank", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    queue_id: integer().references(()=> queueTable.id, {onDelete: 'cascade'}).notNull(),
    rank: text().notNull(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow().$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
})

export const taxiFare = pgTable("taxi_fare", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    queue_id: integer().references(()=> queueTable.id, {onDelete: 'cascade'}).notNull(),
    fare: integer().notNull().default(0),
    from_id: integer().notNull().references(()=> rankTable.id, {onDelete: 'cascade'}),
    to_id: integer().notNull().references(()=> rankTable.id, {onDelete: 'cascade'}),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow().$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
})