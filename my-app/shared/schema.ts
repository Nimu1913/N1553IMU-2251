import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Dealer Networks table
export const dealerNetworks = pgTable("dealer_networks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // 'corporate', 'franchise', 'independent'
  headquarters: text("headquarters"),
  established: integer("established"),
  totalDealerships: integer("total_dealerships").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dealers table
export const dealers = pgTable("dealers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  networkId: varchar("network_id").references(() => dealerNetworks.id),
  type: text("type").notNull(), // 'network', 'independent'
  city: text("city").notNull(),
  region: text("region"),
  country: text("country").default("Sweden"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  established: integer("established"),
  employeeCount: integer("employee_count").default(1),
  monthlyRevenue: decimal("monthly_revenue"),
  status: text("status").default("active"), // 'active', 'inactive', 'suspended'
  plan: text("plan").default("basic"), // 'basic', 'pro', 'enterprise'
  specializations: text("specializations").array(),
  brands: text("brands").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealerId: varchar("dealer_id").references(() => dealers.id).notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").default("sales_rep"), // 'owner', 'manager', 'sales_rep', 'admin'
  joinDate: timestamp("join_date").defaultNow(),
  status: text("status").default("active"), // 'active', 'inactive'
  performanceData: text("performance_data"), // JSON field for sales metrics
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealerId: varchar("dealer_id").references(() => dealers.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  leadId: varchar("lead_id").references(() => leads.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  appointmentType: text("appointment_type").notNull(), // test_drive, sales_meeting, trade_in, service
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  vehicleInfo: text("vehicle_info"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(60), // minutes
  status: text("status").default("scheduled"), // scheduled, confirmed, completed, cancelled, no_show
  notes: text("notes"),
  leadSource: text("lead_source"),
  customerRating: integer("customer_rating"), // 1-5 stars after completion
  customerFeedback: text("customer_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealerId: varchar("dealer_id").references(() => dealers.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  leadSource: text("lead_source").notNull(), // online, phone, walk_in, referral, blocket, facebook, instagram
  leadStatus: text("lead_status").default("new"), // new, contacted, qualified, hot, warm, cold, converted, lost
  interestedVehicle: varchar("interested_vehicle").references(() => vehicles.id),
  budget: decimal("budget"),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  followUpDate: timestamp("follow_up_date"),
  score: integer("score").default(0), // lead scoring 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealerId: varchar("dealer_id").references(() => dealers.id).notNull(),
  vin: text("vin").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  trim: text("trim"),
  color: text("color"),
  mileage: integer("mileage"),
  price: decimal("price"),
  condition: text("condition").default("used"), // 'new', 'used', 'certified'
  status: text("status").default("available"), // 'available', 'sold', 'reserved', 'maintenance'
  fuelType: text("fuel_type"), // 'gasoline', 'diesel', 'hybrid', 'electric'
  transmission: text("transmission"), // 'manual', 'automatic'
  features: text("features").array(),
  description: text("description"),
  images: text("images").array(),
  userId: varchar("user_id").references(() => users.id), // assigned salesperson
  addedDate: timestamp("added_date").defaultNow(),
  soldDate: timestamp("sold_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertDealerNetworkSchema = createInsertSchema(dealerNetworks).omit({
  id: true,
  createdAt: true,
});

export const insertDealerSchema = createInsertSchema(dealers).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  joinDate: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  addedDate: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type InsertDealerNetwork = z.infer<typeof insertDealerNetworkSchema>;
export type DealerNetwork = typeof dealerNetworks.$inferSelect;
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Dealer = typeof dealers.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

// Blocket Ad schema
export const blocketAds = pgTable("blocket_ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull().unique(), // Blocket's source_id
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  blocketAdId: varchar("blocket_ad_id"), // Blocket's internal ad ID
  bytbilAdId: varchar("bytbil_ad_id"), // Bytbil's internal ad ID
  categoryId: integer("category_id").notNull(), // Blocket category
  title: text("title").notNull(),
  body: text("body").notNull(),
  price: decimal("price").notNull(),
  status: text("status").default("created"), // created, published, error, deleted
  adState: text("ad_state"), // Blocket's ad state: created, deleted
  lastAction: text("last_action"), // create, update, bump, boost, publish, delete
  actionState: text("action_state"), // processing, done, error
  errorMessage: text("error_message"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlocketAdSchema = createInsertSchema(blocketAds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBlocketAd = z.infer<typeof insertBlocketAdSchema>;
export type BlocketAd = typeof blocketAds.$inferSelect;
