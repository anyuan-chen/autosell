import prisma from "@/lib/db";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        rank: "asc",
      },
    });
    console.log("locations", locations);
    return Response.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return Response.json(
      { success: false, error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

interface LocationInput {
  name: string;
  address: string;
  long: number;
  lat: number;
  rank: number;
  isPublicPlace: boolean;
  hasPeopleAround: boolean;
  hasSecurityCameras: boolean;
  reasoning?: string;
}

export async function POST(request: Request) {
  try {
    const { locations } = (await request.json()) as {
      locations: LocationInput[];
    };
    // Use transaction to ensure atomicity
    await prisma.$transaction(async (prisma) => {
      // Delete all existing locations
      await prisma.location.deleteMany();

      // Insert new locations
      if (locations.length > 0) {
        await prisma.location.createMany({
          data: locations.map((loc) => ({
            name: loc.name,
            address: loc.address,
            long: loc.long,
            lat: loc.lat,
            reasoning: loc.reasoning ?? "",
            rank: loc.rank,
            isPublicPlace: loc.isPublicPlace,
            hasPeopleAround: loc.hasPeopleAround,
            hasSecurityCameras: loc.hasSecurityCameras,
          })),
        });
      }
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Error replacing locations:", error);
    return Response.json(
      { success: false, error: "Failed to replace locations" },
      { status: 500 }
    );
  }
}
