/* eslint-disable @typescript-eslint/no-explicit-any */
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const prompt = `Given the following conversation between a buyer and seller, provide a single, concise sentence that summarizes the current status of the conversation. Focus on where they are in the negotiation/sale process.

Example summaries:
- "Buyer and seller agreed to meet at Tim Hortons tomorrow at 3 PM"
- "Price negotiation ongoing, current offer is $150"
- "Buyer showed interest but hasn't responded in 3 days"
- "Sale completed successfully"
- "Initial inquiry about product availability"

Conversation:
${messages.map((msg: any) => `${msg.role}: ${msg.text}`).join("\n")}

Remember to respond with only ONE sentence.`;

    const analysis = await generateText({
      model: openai("gpt-4"),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      success: true,
      summary: analysis.text.trim(),
    });
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    return Response.json(
      { success: false, error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}
