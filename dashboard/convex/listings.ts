import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db.query("listings").collect();

    const listingsWithLeads = await Promise.all(
      listings.map(async (listing) => {
        const leads = await ctx.db
          .query("leads")
          .filter((q) => q.eq(q.field("listingId"), listing._id))
          .collect();
        return { ...listing, leads };
      })
    );

    return listingsWithLeads;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    src: v.string(),
    kijijiLink: v.optional(v.string()),
    craigslistLink: v.optional(v.string()),
    shopifyLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const listingId = await ctx.db.insert("listings", {
      title: args.title,
      price: args.price,
      kijijiLink: args.kijijiLink,
      craigslistLink: args.craigslistLink,
      shopifyLink: args.shopifyLink,
      src: args.src,
    });
    return listingId;
  },
});
