import { generateLocationInfo } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get location from search params
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    // Validate input
    if (!location || typeof location !== "string") {
      return NextResponse.json(
        { error: "Location description is required" },
        { status: 400 }
      );
    }

    const analysis = await generateLocationInfo(location);

    // Return the result
    console.log(analysis.object)
    return NextResponse.json(analysis.object);
  } catch (error) {
    console.error("Location analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze location" },
      { status: 500 }
    );
  }
}
