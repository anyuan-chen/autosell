import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const generateLocationInfo = async (objectInfo: string) => {
  const result = await generateObject({
    model: openai("gpt-4o-2024-08-06", {
      structuredOutputs: true,
    }),
    schemaName: "locationAnalysis",
    schemaDescription:
      "Analysis of a location's characteristics regarding privacy and security",
    schema: z.object({
      isPublicPlace: z
        .boolean()
        .describe("Whether this is a public place or private property"),
      hasPeopleAround: z
        .boolean()
        .describe("Whether there are likely to be other people around"),
      hasSecurityCameras: z
        .boolean()
        .describe("Whether security cameras are likely present"),
      reasoning: z
        .string()
        .describe("Brief explanation of the analysis results (<200 chars)"),
    }),
    prompt: `Analyze this location and determine:
1. If it's a public place
2. If other people are typically present
3. If security cameras are likely present

Location details: ${objectInfo}`,
  });
  return result;
};
