#!/usr/bin/env tsx

/**
 * Database Seeding Script for Dealership Management System
 * 
 * This script seeds your Supabase database with comprehensive test data
 * Usage: npx tsx scripts/seed-database.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  dealerNetworks, 
  dealers, 
  users, 
  vehicles, 
  leads, 
  appointments,
  type InsertDealerNetwork,
  type InsertDealer,
  type InsertUser,
  type InsertVehicle,
  type InsertLead,
  type InsertAppointment
} from "../shared/schema";

// Database connection
const connectionString = process.env.DATABASE_URL || "your-supabase-connection-string";
const client = postgres(connectionString);
const db = drizzle(client);

// Seed Data
const seedNetworks: InsertDealerNetwork[] = [
  {
    name: "Nordic Auto Group",
    type: "corporate",
    headquarters: "Stockholm, Sweden",
    established: 1995,
    totalDealerships: 12,
  },
  {
    name: "Scandinavian Motors",
    type: "franchise", 
    headquarters: "Göteborg, Sweden",
    established: 2001,
    totalDealerships: 8,
  },
  {
    name: "Premium Cars Sweden",
    type: "franchise",
    headquarters: "Malmö, Sweden", 
    established: 2008,
    totalDealerships: 5,
  }
];

const seedDealers: Omit<InsertDealer, 'networkId'>[] = [
  {
    name: "TESTRIDE Stockholm Central",
    type: "network",
    city: "Stockholm",
    region: "Stockholm County",
    address: "Kungsgatan 45, 111 22 Stockholm",
    phone: "+46 8 123 4567",
    email: "info@testride-stockholm.se",
    website: "https://testride-stockholm.se",
    established: 1995,
    employeeCount: 25,
    monthlyRevenue: "2650000",
    status: "active",
    plan: "enterprise",
    specializations: ["Luxury Cars", "Electric Vehicles", "Certified Pre-Owned"],
    brands: ["BMW", "Mercedes-Benz", "Audi", "Tesla", "Volvo"]
  },
  {
    name: "Electric Dreams Motors",
    type: "independent",
    city: "Stockholm",
    region: "Stockholm County",
    address: "Södermalm 33, 118 26 Stockholm", 
    phone: "+46 8 777 8899",
    email: "info@electricdreams.se",
    website: "https://electricdreams.se",
    established: 2019,
    employeeCount: 8,
    monthlyRevenue: "950000",
    status: "active",
    plan: "pro",
    specializations: ["Electric Vehicles", "Sustainable Mobility"],
    brands: ["Tesla", "Polestar", "BMW i", "Hyundai"]
  },
  {
    name: "Student Cars Lund",
    type: "independent", 
    city: "Lund",
    region: "Skåne County",
    address: "Universitetsplatsen 3, 223 50 Lund",
    phone: "+46 46 222 3344",
    email: "info@studentcars-lund.se",
    established: 2015,
    employeeCount: 5,
    monthlyRevenue: "320000",
    status: "active",
    plan: "basic",
    specializations: ["Budget Cars", "Student Financing"],
    brands: ["Ford", "Opel", "Peugeot", "Citroën"]
  }
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(appointments);
    await db.delete(leads);
    await db.delete(vehicles);
    await db.delete(users);
    await db.delete(dealers);
    await db.delete(dealerNetworks);

    // Seed Networks
    console.log("📡 Seeding dealer networks...");
    const insertedNetworks = await db.insert(dealerNetworks).values(seedNetworks).returning();
    
    // Seed Dealers
    console.log("🏢 Seeding dealers...");
    const dealersWithNetworks: InsertDealer[] = seedDealers.map((dealer, index) => ({
      ...dealer,
      networkId: index === 0 ? insertedNetworks[0].id : null
    }));
    
    const insertedDealers = await db.insert(dealers).values(dealersWithNetworks).returning();

    // Seed Users
    console.log("👥 Seeding users...");
    const seedUsers: InsertUser[] = [];
    
    insertedDealers.forEach((dealer) => {
      // Owner
      seedUsers.push({
        dealerId: dealer.id,
        username: `owner_${dealer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        email: `owner@${dealer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.se`,
        password: "password123",
        name: `${dealer.name} Owner`,
        phone: dealer.phone,
        role: "owner",
      });
      
      // Sales Rep
      seedUsers.push({
        dealerId: dealer.id,
        username: `sales_${dealer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        email: `sales@${dealer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.se`,
        password: "password123",
        name: "Erik Johansson",
        phone: "+46 70 123 4567",
        role: "sales_rep",
      });
    });

    const insertedUsers = await db.insert(users).values(seedUsers).returning();

    // Seed Vehicles
    console.log("🚗 Seeding vehicles...");
    const seedVehicles: InsertVehicle[] = [
      {
        dealerId: insertedDealers[0].id,
        vin: "WBXPC9C50WP000001",
        make: "BMW",
        model: "X3",
        year: 2023,
        color: "White",
        mileage: 12500,
        price: "459000",
        condition: "used",
        status: "available",
        fuelType: "gasoline",
        transmission: "automatic",
        features: ["Navigation", "Leather"],
        description: "Excellent condition BMW X3"
      }
    ];
    
    await db.insert(vehicles).values(seedVehicles);

    console.log("✅ Database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run seeding
seedDatabase();