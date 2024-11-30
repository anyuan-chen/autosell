import { Stagehand } from "@browserbasehq/stagehand";
import express, { Request, Response } from "express";
import cors from "cors";
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";
import { postKijijiAd, responder, runKijijiLogin } from "kijiji.js";
import { postShopifyAd } from "shopify.js";

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

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

// @ts-ignore
app.post("/post-kijiji", async (req: Request, res: Response) => {
  const { src } = req.query;
  if (!src || typeof src !== "string") {
    return res.status(400).json({ error: "Missing or invalid src parameter" });
  }

  const listing = await client.query(api.listings.get, {
    src: src,
  });
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  try {
    const url = await postKijijiAd(
      src,
      listing.title,
      listing.description,
      listing.price,
    );
  } catch (error) {
    console.error("Error posting Kijiji ad:", error);
    return res
      .status(500)
      .json({ error: "Failed to post Kijiji ad\n" + error });
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  let url = await kijijiStagehand.page.url();
  console.log("Final URL:", url);

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
  const { src } = req.query;
  if (!src || typeof src !== "string") {
    return res.status(400).json({ error: "Missing or invalid src parameter" });
  }

  const listing = await client.query(api.listings.get, {
    src: src,
  });

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  try {
    const url = await postShopifyAd(
      src,
      listing.title,
      listing.description,
      listing.price,
    );
  } catch (error) {
    console.error("Error posting Kijiji ad:", error);
    return res
      .status(500)
      .json({ error: "Failed to post Kijiji ad\n" + error });
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  let url = await shopifyStagehand.page.url();
  console.log("Final URL:", url);

  if (!url || url.indexOf("posted") === -1) {
    res.send({ url });
  } else {
    res.send({
      url: url.substring(0, url.indexOf("posted")),
    });
  }
});

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
});
