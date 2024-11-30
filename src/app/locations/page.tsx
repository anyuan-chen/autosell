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

type Location = {
  id: string;
  name: string;
  coordinates: [number, number];
  fullText: string;
  safetyInfo?: {
    isPublicPlace: boolean;
    hasPeopleAround: boolean;
    hasSecurityCameras: boolean;
    reasoning: string;
  };
};

function SortableLocation({ location }: { location: Location }) {
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
      className="bg-white p-4 rounded shadow"
    >
      <div>
        {location.name} ({location.coordinates[0].toFixed(4)},{" "}
        {location.coordinates[1].toFixed(4)})
      </div>
      {location.safetyInfo && (
        <div className="text-sm text-gray-500 mt-2">
          <div>
            Public Place: {location.safetyInfo.isPublicPlace ? "Yes" : "No"}
          </div>
          <div>
            People Around: {location.safetyInfo.hasPeopleAround ? "Yes" : "No"}
          </div>
          <div>
            Security Cameras:{" "}
            {location.safetyInfo.hasSecurityCameras ? "Yes" : "No"}
          </div>
        </div>
      )}
    </li>
  );
}

export default function LocationList() {
  const [locations, setLocations] = useState<Location[]>([]);
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

    if (active.id !== over?.id) {
      setLocations((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addLocation = () => {
    if (newLocation) {
      setLocations([...locations, newLocation]);
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
                  onLocationSelect={(lng, lat, name, fullText) => {
                    setNewLocation(
                      (prev) =>
                        ({
                          ...prev,
                          id: Date.now().toString(),
                          coordinates: [lng, lat],
                          name,
                          fullText,
                        } as Location)
                    );
                    fetch(
                      `/api/ai/location-safety?location=${encodeURIComponent(
                        fullText
                      )}`
                    )
                      .then((res) => res.json())
                      .then((safetyInfo) => {
                        console.log(safetyInfo);
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

      {locations.length === 0 ? (
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
            items={locations}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {locations.map((location) => (
                <SortableLocation key={location.id} location={location} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
