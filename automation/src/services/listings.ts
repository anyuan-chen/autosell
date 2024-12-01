import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAll = async () => {
  const listings = await prisma.listing.findMany({
    include: {
      leads: true,
    },
  });
  return listings;
};

export const get = async (src: string) => {
  const listing = await prisma.listing.findFirst({
    where: {
      src,
    },
  });
  return listing;
};

export const getByKijijiLink = async (kijijiLink: string) => {
  const listing = await prisma.listing.findFirst({
    where: {
      kijijiLink,
    },
  });
  return listing;
};

export const upsert = async ({
  title,
  price,
  kijijiLink,
  craigslistLink,
  shopifyLink,
  src,
  description = "", // Added this since it's required in your schema
}: {
  title?: string;
  price?: number;
  kijijiLink?: string;
  craigslistLink?: string;
  shopifyLink?: string;
  src: string;
  description?: string;
}) => {
  // First try to find an existing listing
  const existingListing = await prisma.listing.findFirst({
    where: {
      OR: [
        { kijijiLink: kijijiLink || null },
        { craigslistLink: craigslistLink || null },
        { shopifyLink: shopifyLink || null },
        { src },
      ],
    },
  });

  if (existingListing) {
    const updated = await prisma.listing.update({
      where: {
        id: existingListing.id,
      },
      data: {
        src,
        title: title || existingListing.title,
        price: price || existingListing.price,
        kijijiLink: kijijiLink || null,
        craigslistLink: craigslistLink || null,
        shopifyLink: shopifyLink || null,
        description: description || existingListing.description,
      },
    });
    return updated.id;
  }

  // Create new listing
  const created = await prisma.listing.create({
    data: {
      src,
      title: title || "",
      price: price || 0,
      kijijiLink: kijijiLink || null,
      craigslistLink: craigslistLink || null,
      shopifyLink: shopifyLink || null,
      description: description || "",
    },
  });
  return created.id;
};
