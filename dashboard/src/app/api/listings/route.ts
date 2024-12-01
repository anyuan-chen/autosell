import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function GET() {
  try {
    const l = await prisma.listing.findMany({
      include: {
        Lead: true,
      },
    });
    const listingWithLeads = l.map((lead) => {
      return {
        ...lead,
        Lead: undefined,
        leads: lead.Lead,
      };
    });
    return Response.json({
      success: true,
      listingWithLeads,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return Response.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

interface ListingInput {
  title: string;
  description: string;
  price: number;
  src: string;
  kijijiLink?: string;
  craigslistLink?: string;
  shopifyLink?: string;
}

export async function POST(request: Request) {
  try {
    const { newListing } = (await request.json()) as {
      newListing: ListingInput;
    };
    const listing = await prisma.listing.create({
      data: {
        title: newListing.title,
        description: newListing.description,
        price: newListing.price,
        src: newListing.src,
        kijijiLink: newListing.kijijiLink || null,
        craigslistLink: newListing.craigslistLink || null,
        shopifyLink: newListing.shopifyLink || null,
      },
    });

    return Response.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error("Error inserting new listing:", error);
    return Response.json(
      { success: false, error: "Failed to insert listing" },
      { status: 500 }
    );
  }
}
