import { db } from "../../db";
import { user } from "../../db/schema/auth"; // Make sure this path is correct
import { os } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Get user profile by ID
export const getUserProfile = os
  .input(z.object({ userId: z.string() }))
  .handler(async (opt) => {
    const { userId } = opt.input;

    try {
      // Use direct query instead of db.query if schema typing is problematic
      const userProfile = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userProfile[0]) {
        throw new Error("User not found");
      }

      return userProfile[0];
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  });

// Get user dashboard stats
export const getUserStats = os
  .input(z.object({ userId: z.string() }))
  .handler(async (opt) => {
    const { userId } = opt.input;

    try {
      // TODO: Replace with actual queries to your purchases, reviews, favorites tables
      // For now, returning mock data with correct types

      return {
        totalPurchases: 12,
        totalSpent: 450.99,
        reviewsGiven: 8,
        favoriteProducts: 15,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw new Error("Failed to fetch user stats");
    }
  });

// Get user purchases
export const getUserPurchases = os
  .input(
    z.object({
      userId: z.string(),
      limit: z.number().optional().default(10),
    })
  )
  .handler(async (opt) => {
    const { userId, limit } = opt.input;

    try {
      // TODO: Replace with actual purchases query
      // For now, returning typed mock data

      return [
        {
          id: "1",
          productName: "Minecraft Resource Pack - Medieval",
          productImage: "/placeholder.svg",
          price: 12.99,
          purchaseDate: "2024-01-15",
          status: "completed" as const,
        },
        {
          id: "2",
          productName: "Roblox Script - Auto Farm",
          productImage: "/placeholder.svg",
          price: 25.0,
          purchaseDate: "2024-01-10",
          status: "completed" as const,
        },
      ];
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      throw new Error("Failed to fetch user purchases");
    }
  });

// Get user reviews
export const getUserReviews = os
  .input(
    z.object({
      userId: z.string(),
      limit: z.number().optional().default(10),
    })
  )
  .handler(async (opt) => {
    const { userId, limit } = opt.input;

    try {
      // TODO: Replace with actual reviews query

      return [
        {
          id: "1",
          productName: "Minecraft Resource Pack - Medieval",
          rating: 5,
          comment: "Amazing quality textures, exactly what I was looking for!",
          date: "2024-01-16",
        },
        {
          id: "2",
          productName: "Roblox Script - Auto Farm",
          rating: 4,
          comment: "Works great, but could use more configuration options.",
          date: "2024-01-12",
        },
      ];
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      throw new Error("Failed to fetch user reviews");
    }
  });

// Get developer stats
export const getDeveloperStats = os
  .input(z.object({ userId: z.string() }))
  .handler(async (opt) => {
    const { userId } = opt.input;

    try {
      // TODO: Replace with actual queries

      return {
        totalProducts: 25,
        totalRevenue: 12450.5,
        totalCustomers: 340,
        totalReviews: 89,
        averageRating: 4.7,
        monthlyRevenue: 2340.75,
      };
    } catch (error) {
      console.error("Error fetching developer stats:", error);
      throw new Error("Failed to fetch developer stats");
    }
  });

// Get developer products
export const getDeveloperProducts = os
  .input(
    z.object({
      userId: z.string(),
      limit: z.number().optional().default(10),
    })
  )
  .handler(async (opt) => {
    const { userId, limit } = opt.input;

    try {
      // TODO: Replace with actual products query

      return [
        {
          id: "1",
          name: "Advanced Minecraft Shaders",
          price: 19.99,
          sold: 245,
          rating: 4.8,
          reviews: 67,
          revenue: 4897.55,
          status: "active" as const,
        },
        {
          id: "2",
          name: "FiveM Vehicle Pack",
          price: 35.0,
          sold: 89,
          rating: 4.6,
          reviews: 23,
          revenue: 3115.0,
          status: "active" as const,
        },
      ];
    } catch (error) {
      console.error("Error fetching developer products:", error);
      throw new Error("Failed to fetch developer products");
    }
  });

// Export the user router - ADD THIS TO YOUR MAIN ORPC ROUTER
export const userRouter = {
  getProfile: getUserProfile,
  getStats: getUserStats,
  getPurchases: getUserPurchases,
  getReviews: getUserReviews,
  getDeveloperStats: getDeveloperStats,
  getDeveloperProducts: getDeveloperProducts,
};
