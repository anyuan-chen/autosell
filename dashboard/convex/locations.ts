import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db.query("locations").order("asc").collect();
    locations.sort((a, b) => a.rank - b.rank);
    return locations;
  },
});

export const replaceAll = mutation({
  args: {
    locations: v.array(
      v.object({
        name: v.string(),
        coordinates: v.array(v.number()),
        safetyInfo: v.optional(
          v.object({
            isPublicPlace: v.boolean(),
            hasPeopleAround: v.boolean(),
            hasSecurityCameras: v.boolean(),
            reasoning: v.string(),
          })
        ),
        rank: v.number(),
        address: v.string()
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete all existing locations
    const existingLocations = await ctx.db.query("locations").collect();
    for (const location of existingLocations) {
      await ctx.db.delete(location._id);
    }

    // Insert new locations
    for (const location of args.locations) {
      await ctx.db.insert("locations", location);
    }
  },
});
