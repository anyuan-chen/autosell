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
      }),
    );

    return listingsWithLeads;
  },
});

export const upsert = mutation({
  args: {
    title: v.string(),
    price: v.number(),
    kijijiLink: v.string(),
    craigslistLink: v.string(),
    src: v.string()
  },
  handler: async (ctx, args) => {
    const existingListing = await ctx.db
      .query("listings")
      .filter((q) =>
        q.or(
          q.eq(q.field("kijijiLink"), args.kijijiLink),
          q.eq(q.field("craigslistLink"), args.craigslistLink),
          q.eq(q.field("src"), args.src)
        ),
      )
      .first();

    if (existingListing) {
      await ctx.db.patch(existingListing._id, {
        title: args.title,
        price: args.price,
        kijijiLink: args.kijijiLink,
        craigslistLink: args.craigslistLink,
      });
      return existingListing._id;
    }

    const listingId = await ctx.db.insert("listings", {
      title: args.title,
      price: args.price,
      kijijiLink: args.kijijiLink,
      craigslistLink: args.craigslistLink,
    });
    return listingId;
  },
});
