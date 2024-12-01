import { useState } from "react";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setProgress(0);

      const response = await fetch("/api/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          expiresIn: 86400,
        }),
      });

      const { success, url, key } = await response.json();

      if (!success || !url) {
        throw new Error("Failed to get signed URL");
      }

      const upload = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!upload.ok) {
        throw new Error("Failed to upload file");
      }

      return key;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
  };
}
