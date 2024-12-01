export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        rank: "asc",
      },
    });

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
  coordinates: [number, number];
  rank: number;
  safetyInfo?: {
    isPublicPlace: boolean;
    hasPeopleAround: boolean;
    hasSecurityCameras: boolean;
    reasoning?: string;
  };
}

export async function POST(request: Request) {
  try {
    const { locations } = (await request.json()) as {
      locations: LocationInput[];
    };

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete all existing locations
      await tx.location.deleteMany();

      // Insert new locations
      if (locations.length > 0) {
        await tx.location.createMany({
          data: locations.map((loc) => ({
            name: loc.name,
            address: loc.address,
            coordinates: loc.coordinates,
            rank: loc.rank,
            safetyInfo: loc.safetyInfo,
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
