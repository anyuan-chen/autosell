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
import { useR2Url } from "@/hooks/use-r2-url";

export default function ListingsPage() {
  const { uploadFile, isUploading, progress } = useUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(true);
  const { getUrl } = useR2Url();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (selectedFile: File) => {
    console.log("handling upload");
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    try {
      const key = await uploadFile(selectedFile);
      if (key) {
        setProcessing(true);
        const fileUrl = await getUrl(key);
        if (!fileUrl) {
          throw new Error("Failed to get file URL");
        }
        console.log("fileUrl", fileUrl);
        const analyzeResponse = await fetch("/api/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: fileUrl }),
        });
        const analyzeData = await analyzeResponse.json();
        console.log(analyzeData);

        if (!analyzeData.success) {
          throw new Error(analyzeData.error);
        }

        const generateResponse = await fetch("/api/generate-listing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productInfo: analyzeData.text }),
        });
        const generateData = await generateResponse.json();
        console.log(generateData);

        if (!generateData.success) {
          throw new Error(generateData.error);
        }

        const listing = generateData.listing;
        console.log("listing", listing);
        const createListingResponse = await fetch("/api/listings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newListing: {
              src: fileUrl,
              title: listing.title,
              description: listing.description,
              price: listing.price,
            },
          }),
        });
        const createListingData = await createListingResponse.json();
        if (!createListingData.success) {
          throw new Error(createListingData.error);
        }
        console.log("i got here!");
        const [kijijiRes, shopifyRes, craigslistRes] = await Promise.all([
          fetch("http://localhost:3001/post-kijiji", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              src: fileUrl,
            }),
            mode: "cors",
          }),
          fetch("http://localhost:3001/post-shopify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              src: fileUrl,
            }),
            mode: "cors",
          }),
          fetch("http://localhost:3001/post-craigslist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              src: fileUrl,
            }),
            mode: "cors",
          }),
        ]);

        setOpen(false);
        setProcessing(false);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Listings</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedFile(null)}>
              <Plus className="mr-2 h-4 w-4" /> Create New
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
            </DialogHeader>
            {!selectedFile ? (
              <>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="file">Upload File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".jpg"
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
                      disabled={!selectedFile || isUploading}
                    >
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            ) : processing ? (
              <>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin text-4xl mb-4">⚙️</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Processing Your Image...
                  </h3>
                  <p className="text-gray-600 text-center">
                    We&apos;re analyzing your image and generating the listing
                    details. This may take a moment.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Upload Complete!
                  </h3>
                  <p className="text-gray-600 text-center">
                    We are posting your file to a Kijji, Facebook, and your
                    Shopify site.
                  </p>
                  <Button onClick={() => setOpen(false)} className="mt-4">
                    Done
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <ListingsContainer />
    </div>
  );
}
