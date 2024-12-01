import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function GET() {
    try {
        const listings = await prisma.listings.findMany()

        const listingWithLeads = await Promise.all(
            listings.map(async (listing ) => {
                const leads = await prisma.leads.findMany({
                    where: {
                        listingId: listing.id
                    }
                });
                return { ...listing,  leads };
            })
        );
        return Response.json({
            success: true,
            listingWithLeads,
        })
    } catch(error) {
        console.error("Error fetching listings:", error)
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
            newListing: ListingInput
        };

        const listing = await prisma.listings.Create({data: newListing})
        
        return Response.json({
            success: true,
            listing.id
        })
    } catch (error) {
        console.error("Error inserting new listing:", error)
        return Response.json(
            { success: false, error: "Failed to insert listing" },
            { status: 500 }
        )
    }
}