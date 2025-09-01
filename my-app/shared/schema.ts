import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  dealership: text("dealership"),
  phone: text("phone"),
  role: text("role").default("salesperson"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  appointmentType: text("appointment_type").notNull(), // test_drive, sales_meeting, trade_in, service
  vehicleVIN: text("vehicle_vin"),
  vehicleInfo: text("vehicle_info"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(60), // minutes
  status: text("status").default("scheduled"), // scheduled, confirmed, completed, cancelled
  notes: text("notes"),
  leadSource: text("lead_source"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  leadSource: text("lead_source").notNull(), // online, phone, walk_in, referral
  leadStatus: text("lead_status").default("new"), // new, contacted, qualified, hot, warm, cold, converted, lost
  interestedVehicle: text("interested_vehicle"),
  budget: decimal("budget"),
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  followUpDate: timestamp("follow_up_date"),
  score: integer("score").default(0), // lead scoring 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: text("vin").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  trim: text("trim"),
  color: text("color"),
  mileage: integer("mileage"),
  price: decimal("price"),
  status: text("status").default("available"), // available, sold, reserved
  userId: varchar("user_id").references(() => users.id), // assigned salesperson
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
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
