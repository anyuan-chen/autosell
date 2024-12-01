import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const upsert = mutation({
  args: {
    kijijiLink: v.string(),
    name: v.string(),
    messageLogs: v.string(),
    status: v.union(
      v.literal("Preliminary"),
      v.literal("Price Negotiation"),
      v.literal("Deal"),
      v.literal("Meetup"),
    ),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .filter((q) => {
        const listingAdId = new URL(
          String(q.field("kijijiLink")),
        ).searchParams.get("ad_id");
        const leadAdId = new URL(args.kijijiLink).searchParams.get("ad_id");
        return q.eq(listingAdId, leadAdId);
      })
      .first();

    if (!listing) {
      throw new Error("Listing not found");
    }

    const existingLead = await ctx.db
      .query("leads")
      .filter((q) =>
        q.and(
          q.eq(q.field("listingId"), listing._id),
          q.eq(q.field("name"), args.name),
        ),
      )
      .first();

    if (existingLead) {
      await ctx.db.patch(existingLead._id, {
        status: args.status,
      });
      return existingLead._id;
    }

    const leadId = await ctx.db.insert("leads", {
      listingId: listing._id,
      name: args.name,
      status: args.status,
      messageLogs: args.messageLogs,
    });
    return leadId;
  },
});

export default {
  leads: defineTable({
    listingId: v.id("listings"),
    name: v.string(),
    status: v.union(
      v.literal("Preliminary"),
      v.literal("Price Negotiation"),
      v.literal("Deal"),
      v.literal("Meetup"),
    ),
  }),
};
