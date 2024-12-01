"use client";

import { useEffect, useState } from "react";
import { Listing } from "./Listing";

export function ListingsContainer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [listings, setListings] = useState<any[]>();

  useEffect(() => {
    const fetchListings = async () => {
      const response = await fetch("/api/listings");
      const data = await response.json();
      if (data.success) {
        setListings(data.listingWithLeads);
      }
    };
    fetchListings();
  }, []);

  return (
    <>
      {listings === undefined ? (
        <div className="flex items-center justify-center h-32 w-full px-4">
          <div className="animate-pulse flex space-x-4 w-full">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="space-y-3 w-full">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No listings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Listing key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </>
  );
}
