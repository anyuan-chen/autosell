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
  listings: defineTable({
    title: v.string(),
    price: v.number(),
    src: v.string(),
    kijijiLink: v.optional(v.string()),
    craigslistLink: v.optional(v.string()),
  }),

  leads: defineTable({
    listingId: v.id("listings"),
    name: v.string(),
    status: v.union(
      v.literal("inquiry"),
      v.literal("negotiation"),
      v.literal("closing")
    ),
  }),
});
