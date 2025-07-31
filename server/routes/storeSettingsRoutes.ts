import type { Express } from "express";
import { isAuthenticated } from "../simpleAuth";

export function registerStoreSettingsRoutes(app: Express) {
  // Get store settings
  app.get("/api/store-settings/:storeId", isAuthenticated, async (req, res) => {
    try {
      const { storeId } = req.params;
      
      // Mock store settings data
      const storeSettings = {
        id: storeId,
        name: "Main Optical Store",
        domain: "myopticalstore.com", 
        websiteTitle: "Professional Eye Care Services",
        websiteDescription: "Complete optical care with experienced professionals",
        logo: "",
        favicon: "",
        theme: "modern",
        primaryColor: "#3b82f6",
        secondaryColor: "#64748b",
        stripeEnabled: false,
        stripePublicKey: "",
        stripeSecretKey: "",
        paypalEnabled: false,
        paypalClientId: "",
        paypalSecret: "",
        smsEnabled: false,
        smsProvider: "",
        smsApiKey: "",
        smsFrom: "",
        emailEnabled: false,
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        smtpFromEmail: "",
        smtpFromName: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        googleAnalyticsId: "",
        facebookPixelId: ""
      };

      res.json(storeSettings);
    } catch (error) {
      console.error("Error fetching store settings:", error);
      res.status(500).json({ message: "Failed to fetch store settings" });
    }
  });

  // Update store settings
  app.put("/api/store-settings/:storeId", isAuthenticated, async (req, res) => {
    try {
      const { storeId } = req.params;
      const updateData = req.body;

      // Mock update - replace with actual database update
      const updatedSettings = {
        id: storeId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating store settings:", error);
      res.status(500).json({ message: "Failed to update store settings" });
    }
  });
}