import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAppointmentSchema, insertLeadSchema, insertVehicleSchema, loginSchema, insertBlocketAdSchema } from "@shared/schema";
import { BlocketService } from "./blocket-service";
import { z } from "zod";
import "./types"; // Import session types

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to get current user from session
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      res.status(201).json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointments(req.session.userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment || appointment.userId !== req.session.userId) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const existingAppointment = await storage.getAppointment(req.params.id);
      if (!existingAppointment || existingAppointment.userId !== req.session.userId) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const updateData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, updateData);
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const existingAppointment = await storage.getAppointment(req.params.id);
      if (!existingAppointment || existingAppointment.userId !== req.session.userId) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const deleted = await storage.deleteAppointment(req.params.id);
      if (deleted) {
        res.json({ message: "Appointment deleted successfully" });
      } else {
        res.status(404).json({ message: "Appointment not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Lead routes
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const leads = await storage.getLeads(req.session.userId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/leads", requireAuth, async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead || lead.userId !== req.session.userId) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const existingLead = await storage.getLead(req.params.id);
      if (!existingLead || existingLead.userId !== req.session.userId) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const updateData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, updateData);
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const existingLead = await storage.getLead(req.params.id);
      if (!existingLead || existingLead.userId !== req.session.userId) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const deleted = await storage.deleteLead(req.params.id);
      if (deleted) {
        res.json({ message: "Lead deleted successfully" });
      } else {
        res.status(404).json({ message: "Lead not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/vehicles/vin/:vin", async (req, res) => {
    try {
      const vehicle = await storage.getVehicleByVIN(req.params.vin);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Blocket Ad routes
  app.get("/api/blocket-ads", requireAuth, async (req, res) => {
    try {
      const ads = await storage.getBlocketAds(req.session.userId);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/blocket-ads", requireAuth, async (req, res) => {
    try {
      const adData = insertBlocketAdSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const ad = await storage.createBlocketAd(adData);
      
      // If we have a Blocket API token, create the ad on Blocket
      const blocketToken = process.env.BLOCKET_API_TOKEN;
      if (blocketToken) {
        try {
          const blocketService = new BlocketService(blocketToken);
          const vehicle = await storage.getVehicle(adData.vehicleId!);
          const user = await storage.getUser(req.session.userId);
          
          if (vehicle && user) {
            const blocketAdRequest = BlocketService.vehicleToBlocketAd(
              vehicle,
              user.dealership || "DEFAULT_DEALER", // Use dealership or fallback
              {
                name: user.name,
                phone: user.phone,
                email: user.email,
                company: user.dealership,
              },
              adData.sourceId
            );
            
            const blocketResponse = await blocketService.createAd(blocketAdRequest);
            
            // Update our local ad with Blocket's response
            await storage.updateBlocketAd(ad.id, {
              blocketAdId: blocketResponse.blocket_ad_id,
              bytbilAdId: blocketResponse.bytbil_ad_id,
              adState: blocketResponse.state,
              lastAction: "create",
              actionState: "done",
            });
          }
        } catch (blocketError: any) {
          // Update ad with error status
          await storage.updateBlocketAd(ad.id, {
            actionState: "error",
            errorMessage: blocketError.message,
          });
        }
      }
      
      res.status(201).json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/blocket-ads/:id", requireAuth, async (req, res) => {
    try {
      const ad = await storage.getBlocketAd(req.params.id);
      if (!ad || ad.userId !== req.session.userId) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      // If we have a Blocket API token, get fresh status from Blocket
      const blocketToken = process.env.BLOCKET_API_TOKEN;
      if (blocketToken && ad.sourceId) {
        try {
          const blocketService = new BlocketService(blocketToken);
          const blocketResponse = await blocketService.getAd(ad.sourceId);
          
          // Update local ad with latest status
          const updatedAd = await storage.updateBlocketAd(ad.id, {
            adState: blocketResponse.state,
            blocketAdId: blocketResponse.blocket_ad_id,
            bytbilAdId: blocketResponse.bytbil_ad_id,
          });
          
          res.json({ ...updatedAd, blocketLogs: blocketResponse.logs });
        } catch (blocketError) {
          // Return local ad if Blocket API fails
          res.json(ad);
        }
      } else {
        res.json(ad);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/blocket-ads/:id/bump", requireAuth, async (req, res) => {
    try {
      const ad = await storage.getBlocketAd(req.params.id);
      if (!ad || ad.userId !== req.session.userId) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      const blocketToken = process.env.BLOCKET_API_TOKEN;
      if (!blocketToken || !ad.sourceId) {
        return res.status(400).json({ message: "Blocket API not configured or ad not published" });
      }
      
      const blocketService = new BlocketService(blocketToken);
      const { exclude_blocket, exclude_bytbil } = req.body;
      
      await blocketService.bumpAd(ad.sourceId, { exclude_blocket, exclude_bytbil });
      
      // Update local ad status
      await storage.updateBlocketAd(ad.id, {
        lastAction: "bump",
        actionState: "processing",
      });
      
      res.json({ message: "Ad renewal initiated" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/blocket-ads/:id", requireAuth, async (req, res) => {
    try {
      const ad = await storage.getBlocketAd(req.params.id);
      if (!ad || ad.userId !== req.session.userId) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      // Delete from Blocket first if API is configured
      const blocketToken = process.env.BLOCKET_API_TOKEN;
      if (blocketToken && ad.sourceId) {
        try {
          const blocketService = new BlocketService(blocketToken);
          await blocketService.deleteAd(ad.sourceId);
        } catch (blocketError) {
          // Continue with local deletion even if Blocket deletion fails
        }
      }
      
      const deleted = await storage.deleteBlocketAd(ad.id);
      if (deleted) {
        res.json({ message: "Ad deleted successfully" });
      } else {
        res.status(404).json({ message: "Ad not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
