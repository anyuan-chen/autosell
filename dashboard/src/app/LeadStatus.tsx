import { useState, useEffect } from "react";
import { Lead } from "./Listing";

export function LeadStatus({ lead }: { lead: Lead }) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyzeLead = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/analyze-conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: lead.messageLogs }),
        });

        const data = await response.json();
        if (data.success) {
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("Error analyzing conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    analyzeLead();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Analyzing conversation...</div>
    );
  }

  return (
    <div className="text-xs text-gray-700">{summary || "No messages yet"}</div>
  );
}
