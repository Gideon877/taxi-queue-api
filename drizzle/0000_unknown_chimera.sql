CREATE TABLE "queue_route" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "queue_route_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"queueId" integer NOT NULL,
	"taxiRouteId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "queue" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "queue_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"passengerQueueCount" integer DEFAULT 0 NOT NULL,
	"taxiQueueCount" integer DEFAULT 0 NOT NULL,
	"taxiDepartedCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rank" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rank_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"rankName" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "route" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "route_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fare" integer DEFAULT 0 NOT NULL,
	"fromRankId" integer NOT NULL,
	"toRankId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "queue_route" ADD CONSTRAINT "queue_route_queueId_queue_id_fk" FOREIGN KEY ("queueId") REFERENCES "public"."queue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_route" ADD CONSTRAINT "queue_route_taxiRouteId_route_id_fk" FOREIGN KEY ("taxiRouteId") REFERENCES "public"."route"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route" ADD CONSTRAINT "route_fromRankId_rank_id_fk" FOREIGN KEY ("fromRankId") REFERENCES "public"."rank"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route" ADD CONSTRAINT "route_toRankId_rank_id_fk" FOREIGN KEY ("toRankId") REFERENCES "public"."rank"("id") ON DELETE cascade ON UPDATE no action;