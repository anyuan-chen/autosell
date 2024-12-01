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
        name_listingId: {
          name: existingLead.name,
          listingId: existingLead.listingId,
        },
      },
      data: {
        status,
        messageLogs,
      },
    });
    return `${updated.name}_${updated.listingId}`;
  }

  const created = await prisma.lead.create({
    data: {
      listingId: listing.id,
      name,
      status,
      messageLogs,
    },
  });
  return `${created.name}_${created.listingId}`;
};
