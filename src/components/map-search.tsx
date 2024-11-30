import { useState } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import GeocoderControl from "./geocoder-control";

type MapComponentProps = {
  onLocationSelect: (lng: number, lat: number) => void;
};

export default function MapComponent({ onLocationSelect }: MapComponentProps) {
  const [marker, setMarker] = useState<[number, number] | null>(null);

  return (
    <Map
      initialViewState={{
        longitude: marker?.[0] ?? -122.4,
        latitude: marker?.[1] ?? 37.8,
        zoom: 14,
      }}
      style={{ width: "100%", height: 300 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN}
      onClick={(event: { lngLat: { lng: number; lat: number } }) => {
        const { lng, lat } = event.lngLat;
        setMarker([lng, lat]);
        onLocationSelect(lng, lat);
      }}
    >
      <GeocoderControl
        mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN || ""}
        position="top-left"
      />
      {marker && (
        <Marker longitude={marker[0]} latitude={marker[1]} color="red" />
      )}
    </Map>
  );
}
