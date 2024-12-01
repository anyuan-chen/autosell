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
    src: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    kijijiLink: v.optional(v.string()),
    shopifyLink: v.optional(v.string()),
    craigslistLink: v.optional(v.string()),
  }),

  leads: defineTable({
    listingId: v.id("listings"),
    name: v.string(),
    messageLogs: v.string(),
    status: v.union(
      v.literal("Preliminary"),
      v.literal("Price Negotiation"),
      v.literal("Deal"),
      v.literal("Meetup")
    ),
  }),
});
