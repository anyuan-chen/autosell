"use client";

import Map from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import GeocoderControl from "./geocoder-control";

if (typeof window !== "undefined" && !window.mapboxgl) {
  window.mapboxgl = mapboxgl as unknown as typeof window.mapboxgl;
}

type MapComponentProps = {
  onLocationSelect: (
    lng: number,
    lat: number,
    name: string,
    address: string,
    fullText: string
  ) => void;
};

export default function MapComponent({ onLocationSelect }: MapComponentProps) {
  return (
    <Map
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 14,
      }}
      style={{ width: "100%", height: 300 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
    >
      <GeocoderControl
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}
        position="top-left"
        onLocationSelect={onLocationSelect}
      />
    </Map>
  );
}
