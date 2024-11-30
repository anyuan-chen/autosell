"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LeadStatus } from "./LeadStatus";

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
    leads: Lead[];
  };
}

export function Listing({ listing }: ListingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="bg-white p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-lg font-semibold">{listing.title}</h2>
          <p className="text-gray-600">${listing.price.toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href={listing.kijijiLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Kijiji
          </a>
          <a
            href={listing.craigslistLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Craigslist
          </a>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      {isExpanded && (
        <div className="bg-gray-50 p-4">
          <h3 className="text-md font-semibold mb-2">Leads</h3>
          <ul className="space-y-2">
            {listing.leads.map((lead) => (
              <li key={lead._id} className="flex justify-between items-center">
                <span>{lead.name}</span>
                <LeadStatus status={lead.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
