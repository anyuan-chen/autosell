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

interface Location {
  id: string;
  name: string;
  rank: number;
  address: string;
  long: number;
  lat: number;
  isPublicPlace: boolean;
  hasPeopleAround: boolean;
  hasSecurityCameras: boolean;
  reasoning: string;
}

export function SortableLocation({ location }: { location: Location }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: location.id });

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
            ({location.long.toFixed(4)}, {location.lat.toFixed(4)})
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1">
            {location.isPublicPlace ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">Public Place</span>
          </div>
          <div className="flex items-center gap-1">
            {location.hasPeopleAround ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">People Around</span>
          </div>
          <div className="flex items-center gap-1">
            {location.hasSecurityCameras ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">Security Cameras</span>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function LocationList() {
  const [locations, setLocations] = useState<Location[] | undefined>(undefined);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/locations");
        const data = await response.json();
        if (data.success) {
          setLocations(data.locations);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
      }
    };
    fetchLocations();
  }, []);

  const replaceAll = async (newLocations: { locations: Location[] }) => {
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLocations),
      });
      const data = await response.json();
      if (data.success) {
        setLocations(newLocations.locations);
      }
    } catch (error) {
      console.error("Error replacing locations:", error);
    }
  };

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
      const oldIndex = newLocations.findIndex((item) => item.id === active.id);
      const newIndex = newLocations.findIndex((item) => item.id === over?.id);
      const reorderedLocations = arrayMove(newLocations, oldIndex, newIndex);
      const locationsWithRank = reorderedLocations.map((loc, idx) => {
        return {
          ...loc,
          rank: idx,
        };
      });
      replaceAll({ locations: locationsWithRank });
    }
  };

  const addLocation = async () => {
    if (newLocation && locations) {
      console.log(newLocation, locations);
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
                          long: lng,
                          lat: lat,
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
                      .then(
                        ({
                          isPublicPlace,
                          hasPeopleAround,
                          hasSecurityCameras,
                          reasoning,
                        }) => {
                          setNewLocation((prev) => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              isPublicPlace,
                              hasPeopleAround,
                              hasSecurityCameras,
                              reasoning,
                            };
                          });
                        }
                      )
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
                {newLocation && (
                  <div className="text-sm text-gray-500 space-y-2">
                    <div className="flex items-center">
                      {newLocation.isPublicPlace !== undefined && (
                        <>
                          {newLocation.isPublicPlace ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="ml-2">Public Place</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center">
                      {newLocation.hasPeopleAround !== undefined && (
                        <>
                          {newLocation.hasPeopleAround ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="ml-2">People Around</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center">
                      {newLocation.hasSecurityCameras !== undefined && (
                        <>
                          {newLocation.hasSecurityCameras ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="ml-2">Security Cameras</span>
                        </>
                      )}
                    </div>
                    <div className="pt-8">{newLocation.reasoning}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={addLocation} disabled={!newLocation?.name}>
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
              id: location.id,
            }))}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {locations.map((location: Location) => (
                <SortableLocation key={location.name} location={location} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
