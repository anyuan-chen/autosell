import { useState } from 'react';

export function useR2Url() {
  const [isLoading, setIsLoading] = useState(false);

  const getUrl = async (key: string): Promise<string | null> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/get-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      const { success, url } = await response.json();

      if (!success || !url) {
        throw new Error('Failed to get signed URL');
      }

      return url;
    } catch (error) {
      console.error('Error getting URL:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getUrl,
    isLoading,
  };
} 