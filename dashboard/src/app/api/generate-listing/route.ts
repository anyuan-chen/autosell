import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { productInfo } = await request.json();

    const response = await generateObject({
      model: openai("gpt-4o"),
      prompt: `Here is some information about a product: ${productInfo}. Based on this information, generate a Kijiji listing with the following fields:
      - title: A clear, descriptive title under 40 characters
      - description: A detailed product description
      - price: A reasonable price in CAD`,
      schema: z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
      }),
    });

    return Response.json({
      success: true,
      listing: response.object,
    });
  } catch (error) {
    console.error("Error generating listing:", error);
    return Response.json(
      { success: false, error: "Failed to generate listing" },
      { status: 500 }
    );
  }
} 