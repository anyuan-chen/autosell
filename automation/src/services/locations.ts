import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAll = async () => {
  const locations = await prisma.location.findMany({
    orderBy: {
      rank: "asc",
    },
  });
  return locations;
};

export const replaceAll = async ({
  locations,
}: {
  locations: Array<{
    name: string;
    coordinates: number[];
    safetyInfo?: {
      isPublicPlace: boolean;
      hasPeopleAround: boolean;
      hasSecurityCameras: boolean;
      reasoning: string;
    };
    rank: number;
    address: string;
  }>;
}) => {
  // Delete all existing locations
  await prisma.location.deleteMany();

  // Insert new locations
  await Promise.all(
    locations.map((location) =>
      prisma.location.create({
        data: {
          name: location.name,
          long: location.coordinates[0],
          lat: location.coordinates[1],
          address: location.address,
          isPublicPlace: location.safetyInfo?.isPublicPlace ?? false,
          hasPeopleAround: location.safetyInfo?.hasPeopleAround ?? false,
          hasSecurityCameras: location.safetyInfo?.hasSecurityCameras ?? false,
          reasoning: location.safetyInfo?.reasoning ?? "",
          rank: location.rank,
        },
      }),
    ),
  );
};
