"use client";

import { Button } from "@/components/ui/button";
import { ListingsContainer } from "./ListingContacts";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpload } from "@/hooks/use-upload";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function ListingsPage() {
  const { uploadFile, isUploading, progress } = useUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const key = await uploadFile(selectedFile);
    if (key) {
      console.log("File uploaded successfully:", key);
      setOpen(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="container mx-auto px-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Listings</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Upload File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {isUploading && (
                  <Progress value={progress} className="w-full" />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ListingsContainer />
    </div>
  );
}
