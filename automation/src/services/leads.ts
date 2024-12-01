import { PrismaClient } from "@prisma/client";
import { NegotiationStage } from "../types";

const prisma = new PrismaClient();

export const upsert = async ({
  kijijiLink,
  name,
  messageLogs,
  status,
}: {
  kijijiLink: string;
  name: string;
  messageLogs: string;
  status: NegotiationStage;
}) => {
  const listing = await prisma.listing.findFirst({
    where: {
      kijijiLink,
    },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  const existingLead = await prisma.lead.findFirst({
    where: {
      AND: [{ listingId: listing.id }, { name }],
    },
  });

  if (existingLead) {
    const updated = await prisma.lead.update({
      where: {
        id: existingLead.id,
      },
      data: {
        status,
      },
    });
    return updated.id;
  }

  const created = await prisma.lead.create({
    data: {
      listingId: listing.id,
      name,
      status,
      messageLogs,
    },
  });
  return created.id;
};
