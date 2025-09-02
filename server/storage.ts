import { type User, type InsertUser, type Appointment, type InsertAppointment, type Lead, type InsertLead, type Vehicle, type InsertVehicle, type BlocketAd, type InsertBlocketAd } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Appointments
  getAppointments(userId: string): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
  
  // Leads
  getLeads(userId: string): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicleByVIN(vin: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  
  // Blocket Ads
  getBlocketAds(userId: string): Promise<BlocketAd[]>;
  getBlocketAd(id: string): Promise<BlocketAd | undefined>;
  getBlocketAdBySourceId(sourceId: string): Promise<BlocketAd | undefined>;
  createBlocketAd(ad: InsertBlocketAd): Promise<BlocketAd>;
  updateBlocketAd(id: string, ad: Partial<InsertBlocketAd>): Promise<BlocketAd | undefined>;
  deleteBlocketAd(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private appointments: Map<string, Appointment>;
  private leads: Map<string, Lead>;
  private vehicles: Map<string, Vehicle>;
  private blocketAds: Map<string, BlocketAd>;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.leads = new Map();
    this.vehicles = new Map();
    this.blocketAds = new Map();
    
    // Add sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: "user-1",
      username: "john.smith",
      email: "john@automax.com",
      password: "password", // Simple plain text for demo
      name: "John Smith",
      dealership: "AutoMax Dealership",
      phone: "(555) 123-4567",
      role: "salesperson",
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample vehicles
    const sampleVehicles: Vehicle[] = [
      {
        id: "vehicle-1",
        vin: "1HGCM82633A123456",
        make: "Honda",
        model: "Accord",
        year: 2024,
        trim: "LX",
        color: "Silver",
        mileage: 50,
        price: "28500",
        status: "available",
        userId: null,
        createdAt: new Date(),
      },
      {
        id: "vehicle-2",
        vin: "4T1BF1FK8EU456789",
        make: "Toyota",
        model: "Camry",
        year: 2024,
        trim: "LE",
        color: "Blue",
        mileage: 100,
        price: "27000",
        status: "available",
        userId: null,
        createdAt: new Date(),
      },
    ];
    
    sampleVehicles.forEach(vehicle => {
      this.vehicles.set(vehicle.id, vehicle);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Appointments
  async getAppointments(userId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.userId === userId
    );
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string, updateData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existing = this.appointments.get(id);
    if (!existing) return undefined;
    
    const updated: Appointment = { ...existing, ...updateData };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Leads
  async getLeads(userId: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      lead => lead.userId === userId
    );
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = {
      ...insertLead,
      id,
      createdAt: new Date(),
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: string, updateData: Partial<InsertLead>): Promise<Lead | undefined> {
    const existing = this.leads.get(id);
    if (!existing) return undefined;
    
    const updated: Lead = { ...existing, ...updateData };
    this.leads.set(id, updated);
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    return this.leads.delete(id);
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleByVIN(vin: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(vehicle => vehicle.vin === vin);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      ...insertVehicle,
      id,
      createdAt: new Date(),
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updateData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const existing = this.vehicles.get(id);
    if (!existing) return undefined;
    
    const updated: Vehicle = { ...existing, ...updateData };
    this.vehicles.set(id, updated);
    return updated;
  }

  // Blocket Ads
  async getBlocketAds(userId: string): Promise<BlocketAd[]> {
    return Array.from(this.blocketAds.values()).filter(
      ad => ad.userId === userId
    );
  }

  async getBlocketAd(id: string): Promise<BlocketAd | undefined> {
    return this.blocketAds.get(id);
  }

  async getBlocketAdBySourceId(sourceId: string): Promise<BlocketAd | undefined> {
    return Array.from(this.blocketAds.values()).find(ad => ad.sourceId === sourceId);
  }

  async createBlocketAd(insertAd: InsertBlocketAd): Promise<BlocketAd> {
    const id = randomUUID();
    const ad: BlocketAd = {
      ...insertAd,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blocketAds.set(id, ad);
    return ad;
  }

  async updateBlocketAd(id: string, updateData: Partial<InsertBlocketAd>): Promise<BlocketAd | undefined> {
    const existing = this.blocketAds.get(id);
    if (!existing) return undefined;
    
    const updated: BlocketAd = { ...existing, ...updateData, updatedAt: new Date() };
    this.blocketAds.set(id, updated);
    return updated;
  }

  async deleteBlocketAd(id: string): Promise<boolean> {
    return this.blocketAds.delete(id);
  }
}

export const storage = new MemStorage();
