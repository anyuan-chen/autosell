import { Stagehand } from "@browserbasehq/stagehand";
import express, { Request, Response } from "express";
import cors from "cors";
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";
import { postKijijiAd, runKijijiLogin } from "kijiji.js";
import { postShopifyAd } from "shopify.js";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import {
  ecommercePlatform,
  KijijiCategory,
  KijijiMusicalInstrumentCategory,
} from "types.js";

dotenv.config({ path: ".env.local" });

export const responderStagehand = new Stagehand({
  env: "LOCAL",
});
export const kijijiStagehand = new Stagehand({
  env: "LOCAL",
});
export const shopifyStagehand = new Stagehand({
  env: "LOCAL",
});
const client = new ConvexHttpClient(process.env.CONVEX_URL || "");
// responder()

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

const GenerateProductInfo = async (
  url: string,
  platform: ecommercePlatform,
) => {
  const productInfo = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          { type: "image", image: `${url}` },
          {
            type: "text",
            text: "Analyze this product image and tell me what is the exact product model name of this item? Be detailed.",
          },
        ],
      },
    ],
  });
  console.log(productInfo.text);
  const response = await generateObject({
    model: openai("gpt-4o"),
    prompt: `Here is some information about a product: ${productInfo.text}. Based on this information, generate a ${} listing with the following fields:
    - title: A clear, descriptive title under 40 characters
    - description: A detailed product description
    - price: A reasonable price in CAD
    - category: One of the following Kijiji categories: ${Object.values(KijijiCategory).join(", ")}
    - subcategory: If applicable, a relevant subcategory`,
    schema: z.object({
      title: z.string(),
      description: z.string(),
      price: z.number(),
      category: z.nativeEnum(KijijiCategory),
      subcategory: z.nativeEnum(KijijiMusicalInstrumentCategory).optional(),
    }),
  });

  return response;
};

// @ts-ignore
app.post("/post-kijiji", async (req: Request, res: Response) => {
  const { src } = req.body; 
  if (!src) {
    return res.status(400).json({ error: "Image source URL is required" });
  }
  console.log(src);


  const response = await GenerateProductInfo(src);

  try {
    const url = await postKijijiAd(
      src,
      response.object.title,
      response.object.description,
      response.object.price,
      response.object.category,
      response.object.subcategory,
    );
  } catch (error) {
    console.error("Error posting Kijiji ad:", error);
    return res
      .status(500)
      .json({ error: "Failed to post Kijiji ad\n" + error });
  }
  // Wait for the page to settle after posting
  await new Promise((resolve) => setTimeout(resolve, 2000));
  let url = await kijijiStagehand.page.url();
  console.log("Final URL:", url);

  // If URL is empty or doesn't contain expected pattern, return full URL
  if (!url || url.indexOf("posted") === -1) {
    res.send({ url });
  } else {
    res.send({
      url: url.substring(0, url.indexOf("posted")),
    });
  }
});

// @ts-ignore
app.post("/post-shopify", async (req: Request, res: Response) => {
  const { src } = req.body;
  if (!src) {
    return res.status(400).json({ error: "Image source URL is required" });
  }
  console.log(src);

  const response = await GenerateProductInfo(src);

  try {
    const url = await postShopifyAd(
      src,
      response.object.title,
      response.object.description,
      response.object.price,
      response.object.category,
      response.object.subcategory,
    );
  } catch (error) {
    console.error("Error posting Kijiji ad:", error);
    return res
      .status(500)
      .json({ error: "Failed to post Kijiji ad\n" + error });
  }
  // Wait for the page to settle after posting
  await new Promise((resolve) => setTimeout(resolve, 2000));
  let url = await kijijiStagehand.page.url();
  console.log("Final URL:", url);

  // If URL is empty or doesn't contain expected pattern, return full URL
  if (!url || url.indexOf("posted") === -1) {
    res.send({ url });
  } else {
    res.send({
      url: url.substring(0, url.indexOf("posted")),
    });
  }
});

// const run = async() => {
//   await runKijijiLogin(kijijiStagehand);
//   await postKijijiAd("what is up", "fisdjfoisdjfiodsjfiodsjfoidsjfsoi", 100, KijijiCategory.MusicalInstruments, KijijiMusicalInstrumentCategory.Guitars)
// }

// run()
app.listen(port, async () => {
  await runKijijiLogin(kijijiStagehand);
  // await runKijijiLogin(responderStagehand)
  console.log(`Server listening on port ${port}`);
});
