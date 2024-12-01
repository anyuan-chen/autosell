"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, Plus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MapComponent from "@/components/map-search";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface Location {
  _id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  safetyInfo?: {
    isPublicPlace: boolean;
    hasPeopleAround: boolean;
    hasSecurityCameras: boolean;
    reasoning: string;
  };
}

export function SortableLocation({ location }: { location: Location }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: location._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100"
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-black">
              {location.name}
            </h3>
            <p className="text-sm text-gray-400">{location.address}</p>
          </div>
          <div className="text-xs text-gray-400">
            ({location.coordinates[0].toFixed(4)},{" "}
            {location.coordinates[1].toFixed(4)})
          </div>
        </div>

        {location.safetyInfo && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1">
              {location.safetyInfo.isPublicPlace ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Public Place</span>
            </div>
            <div className="flex items-center gap-1">
              {location.safetyInfo.hasPeopleAround ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">People Around</span>
            </div>
            <div className="flex items-center gap-1">
              {location.safetyInfo.hasSecurityCameras ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Security Cameras</span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

export default function LocationList() {
  const locations = useQuery(api.locations.getAll);
  const replaceAll = useMutation(api.locations.replaceAll);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState<Location | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "n") {
        event.preventDefault();
        setIsDialogOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && locations) {
      const newLocations = [...locations];
      const oldIndex = newLocations.findIndex((item) => item._id === active.id);
      const newIndex = newLocations.findIndex((item) => item._id === over?.id);
      const reorderedLocations = arrayMove(newLocations, oldIndex, newIndex);
      const locationsWithRank = reorderedLocations.map((loc, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, _creationTime, ...rest } = loc;
        return {
          ...rest,
          rank: idx,
        };
      });
      replaceAll({ locations: locationsWithRank });
    }
  };

  const addLocation = async () => {
    if (newLocation && locations) {
      await replaceAll({
        locations: [...locations, { ...newLocation, rank: locations.length }],
      });
      setNewLocation(null);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-8 pt-4">
      <div className="flex items-center w-full justify-between mb-4">
        <h1 className="text-2xl font-bold">Locations</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setNewLocation(null)}>
              <Plus className="mr-2 h-4 w-4" /> Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="col-span-2">
                <MapComponent
                  onLocationSelect={(lng, lat, name, address, fullText) => {
                    setNewLocation(
                      (prev) =>
                        ({
                          ...prev,
                          coordinates: [lng, lat],
                          name,
                          address,
                        }) as Location
                    );
                    fetch(
                      `/api/ai/location-safety?location=${encodeURIComponent(
                        fullText
                      )}`
                    )
                      .then((res) => res.json())
                      .then((safetyInfo) => {
                        setNewLocation((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            safetyInfo,
                          };
                        });
                      })
                      .catch((error) => {
                        console.error(
                          "Failed to get location safety info:",
                          error
                        );
                      });
                  }}
                />
              </div>
              <div className="border rounded-md p-4">
                {newLocation?.safetyInfo && (
                  <div className="text-sm text-gray-500 space-y-2">
                    <div className="flex items-center">
                      {newLocation.safetyInfo.isPublicPlace ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="ml-2">Public Place</span>
                    </div>
                    <div className="flex items-center">
                      {newLocation.safetyInfo.hasPeopleAround ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="ml-2">People Around</span>
                    </div>
                    <div className="flex items-center">
                      {newLocation.safetyInfo.hasSecurityCameras ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="ml-2">Security Cameras</span>
                    </div>
                    <div className="pt-8">
                      {newLocation.safetyInfo.reasoning}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={addLocation}
                disabled={!newLocation?.name || !newLocation?.coordinates}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {locations === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-100 animate-pulse h-20 rounded shadow"
            />
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-32 text-gray-500">
          No locations added yet.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={locations.map((location: Location) => ({
              id: location._id,
            }))}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {locations.map((location: Location) => (
                <SortableLocation
                  key={location.name}
                  location={{
                    ...location,
                    coordinates: [
                      location.coordinates[0],
                      location.coordinates[1],
                    ] as [number, number],
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
