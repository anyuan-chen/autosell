"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LeadStatus } from "./LeadStatus";
import Image from "next/image";

interface Lead {
  _id: string;
  name: string;
  status: "inquiry" | "negotiation" | "closing";
}

interface ListingProps {
  listing: {
    _id: string;
    title: string;
    price: number;
    kijijiLink: string;
    craigslistLink: string;
    shopifyLink: string;
    leads: Lead[];
  };
}

export function Listing({ listing }: ListingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            {listing.title}
          </h2>
          <p className="text-gray-600">${listing.price.toLocaleString()}</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center space-x-6 mr-6">
            <a
              href={listing.kijijiLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-6 h-6 ${!listing.kijijiLink && "opacity-50 grayscale"}`}
            >
              <Image src="/kijiji.jpg" alt="Kijiji" width={24} height={24} />
            </a>
            <a
              href={listing.craigslistLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-6 h-6 ${!listing.craigslistLink && "opacity-50 grayscale"}`}
            >
              <Image
                src="/craigslist.jpg"
                alt="Craigslist"
                width={24}
                height={24}
              />
            </a>
            <a
              href={listing.shopifyLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-6 h-6 ${!listing.shopifyLink && "opacity-50 grayscale"}`}
            >
              <Image src="/shopify.svg" alt="Shopify" width={24} height={24} />
            </a>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="bg-gray-50 p-4">
          {listing.leads.length > 0 ? (
            <ul className="space-y-2">
              {listing.leads.map((lead) => (
                <li
                  key={lead._id}
                  className="flex justify-between items-center"
                >
                  <span>{lead.name}</span>
                  <LeadStatus status={lead.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No leads yet</p>
              <p className="text-sm">
                Leads from your listings will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
