-- Add dealer networks and dealers tables for multi-account management

CREATE TABLE IF NOT EXISTS "dealer_networks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"type" text NOT NULL,
	"headquarters" text,
	"established" integer,
	"total_dealerships" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "dealers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"network_id" varchar,
	"type" text NOT NULL,
	"city" text NOT NULL,
	"region" text,
	"country" text DEFAULT 'Sweden',
	"address" text,
	"phone" text,
	"email" text,
	"website" text,
	"established" integer,
	"employee_count" integer DEFAULT 1,
	"monthly_revenue" numeric,
	"status" text DEFAULT 'active',
	"plan" text DEFAULT 'basic',
	"specializations" text[],
	"brands" text[],
	"created_at" timestamp DEFAULT now()
);

-- Update users table to reference dealers
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dealer_id" varchar NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "join_date" timestamp DEFAULT now();
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "performance_data" text;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'sales_rep';

-- Remove old dealership column if exists
ALTER TABLE "users" DROP COLUMN IF EXISTS "dealership";

-- Update vehicles table
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "dealer_id" varchar NOT NULL;
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "condition" text DEFAULT 'used';
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "fuel_type" text;
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "transmission" text;
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "features" text[];
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "images" text[];
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "added_date" timestamp DEFAULT now();
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "sold_date" timestamp;

-- Update leads table  
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "dealer_id" varchar NOT NULL;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "interested_vehicle" varchar;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "priority" text DEFAULT 'medium';

-- Update appointments table
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "dealer_id" varchar NOT NULL;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "lead_id" varchar;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "vehicle_id" varchar;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "customer_rating" integer;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "customer_feedback" text;

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dealers_network_id_dealer_networks_id_fk') THEN
        ALTER TABLE "dealers" ADD CONSTRAINT "dealers_network_id_dealer_networks_id_fk" FOREIGN KEY ("network_id") REFERENCES "dealer_networks"("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_dealer_id_dealers_id_fk') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "dealers"("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_dealer_id_dealers_id_fk') THEN
        ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "dealers"("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_dealer_id_dealers_id_fk') THEN
        ALTER TABLE "leads" ADD CONSTRAINT "leads_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "dealers"("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_interested_vehicle_vehicles_id_fk') THEN
        ALTER TABLE "leads" ADD CONSTRAINT "leads_interested_vehicle_vehicles_id_fk" FOREIGN KEY ("interested_vehicle") REFERENCES "vehicles"("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_dealer_id_dealers_id_fk') THEN
        ALTER TABLE "appointments" ADD CONSTRAINT "appointments_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "dealers"("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_lead_id_leads_id_fk') THEN
        ALTER TABLE "appointments" ADD CONSTRAINT "appointments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_vehicle_id_vehicles_id_fk') THEN
        ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id");
    END IF;
END $$;