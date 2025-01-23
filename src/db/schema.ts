// import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
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

/**
 * One Rank has many routes starting from or ending at it
 */
export const rankRelations = relations(rankTable, ({ many}) => ({
    fromRoutes: many(taxiRouteTable),
    toRoutes: many(taxiRouteTable),
}))

/**
 * Many routes belong to one Rank (either as fromRank or toRank)
 */
export const taxiRouteRelations = relations(taxiRouteTable, ({ one, many }) => ({
    fromRank: one(rankTable, {
        fields: [taxiRouteTable.fromRankId],
        references: [rankTable.id],
    }),
    toRank: one(rankTable, {
        fields: [taxiRouteTable.toRankId],
        references: [rankTable.id],
    }),
    queues: many(queueRouteTable),
}));

/**
 * Defines the relations between the `queueTable` and other tables.
 *
 * @remarks
 * This function is used to establish the relationships between the `queueTable` and other tables in the database schema.
 * It uses the `relations` function from the `drizzle-orm` library to define the relations.
 *
 * @param queueTable - The table representing the queue in the database.
 * @param options - An object containing the options for defining relations.
 * @returns An object containing the defined relations.
 */
export const queueRelations = relations(queueTable, ({ many }) => ({
    queueRoutes: many(queueRouteTable),
}));

export const queueRouteRelations = relations(queueRouteTable, ({ one }) => ({
    queue: one(queueTable, {
        fields: [queueRouteTable.queueId],
        references: [queueTable.id],
    }),
    taxiRoute: one(taxiRouteTable, {
        fields: [queueRouteTable.taxiRouteId],
        references: [taxiRouteTable.id],
    }),
}));
