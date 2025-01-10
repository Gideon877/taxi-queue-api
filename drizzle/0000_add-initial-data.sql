CREATE TABLE "queue" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "queue_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"passenger_queue_count" integer DEFAULT 0 NOT NULL,
	"taxi_queue_count" integer DEFAULT 0 NOT NULL,
	"taxi_departed_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
