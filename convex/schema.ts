import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  locations: defineTable({
    name: v.string(),
    coordinates: v.array(v.number()),
    address: v.string(),
    safetyInfo: v.optional(
      v.object({
        isPublicPlace: v.boolean(),
        hasPeopleAround: v.boolean(),
        hasSecurityCameras: v.boolean(),
        reasoning: v.string(),
      })
    ),
    rank: v.number(),
  }),
});
