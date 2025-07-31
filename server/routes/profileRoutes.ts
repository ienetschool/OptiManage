import type { Express } from "express";
import { isAuthenticated } from "../simpleAuth";

export function registerProfileRoutes(app: Express) {
  // Get user profile
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Mock profile data for now - replace with actual database query
      const profileData = {
        id: userId,
        firstName: req.user.claims.first_name || "",
        lastName: req.user.claims.last_name || "",
        email: req.user.claims.email || "",
        phone: "",
        address: "",
        dateOfBirth: "",
        bio: "",
        profileImageUrl: req.user.claims.profile_image_url || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update user profile
  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;

      // Mock update for now - replace with actual database update
      const updatedProfile = {
        id: userId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
}