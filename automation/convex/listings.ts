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

export const get = query({
  args: { src: v.string() },
  handler: async (ctx, args) => {
    console.log(args)
    const listing = await ctx.db
      .query("listings")
      .filter((q) => q.eq(q.field("src"), args.src)).first()
    console.log("after listing")
    return listing;
  },
});

export const getByKijijiLink = query({
  args: { kijijiLink: v.string() },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .filter((q) => q.eq(q.field("kijijiLink"), args.kijijiLink))
      .first();
    return listing;
  },
});


export const upsert = mutation({
  args: {
    title: v.optional(v.string()),
    price: v.optional(v.number()),
    kijijiLink: v.optional(v.string()),
    craigslistLink: v.optional(v.string()),
    shopifyLink: v.optional(v.string()),
    src: v.string()
  },
  handler: async (ctx, args) => {
    const existingListing = await ctx.db
      .query("listings")
      .filter((q) =>
        q.or(
          q.eq(q.field("kijijiLink"), args.kijijiLink),
          q.eq(q.field("craigslistLink"), args.craigslistLink),
          q.eq(q.field("shopifyLink"), args.shopifyLink),
          q.eq(q.field("src"), args.src)
        ),
      )
      .first();

    if (existingListing) {
      await ctx.db.patch(existingListing._id, {
        src: args.src,
        title: args.title,
        price: args.price,
        kijijiLink: args.kijijiLink,
        craigslistLink: args.craigslistLink,
        shopifyLink: args.shopifyLink,
      });
      return existingListing._id;
    }

    const listingId = await ctx.db.insert("listings", {
      src: args.src || "",
      title: args.title || "",
      price: args.price || 0,
      kijijiLink: args.kijijiLink,
      craigslistLink: args.craigslistLink,
      shopifyLink: args.shopifyLink
    });
    return listingId;
  },
});
