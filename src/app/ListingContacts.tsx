"use client";

import { Listing } from "./Listing";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ListingsContainer() {
  const listings = useQuery(api.listings.getAll);

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
            <Listing key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </>
  );
}
