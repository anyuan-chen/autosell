import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    const productInfo = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image: imageUrl },
            {
              type: "text",
              text: "Analyze this product image and tell me what is the exact product model name of this item? Be detailed.",
            },
          ],
        },
      ],
    });

    return Response.json({
      success: true,
      text: productInfo.text,
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return Response.json(
      { success: false, error: "Failed to analyze image" },
      { status: 500 }
    );
  }
} 