import { Stagehand } from "@browserbasehq/stagehand";
import express, { Request, Response } from "express";
import cors from "cors";
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";
import {
  MessageScanner,
  postKijijiAd,
  respondToKijiji,
  runKijijiLogin,
} from "kijiji.js";
import { postShopifyAd } from "shopify.js";
import { postCraigsListAd } from "craiglist.js";

dotenv.config({ path: ".env.local" });

export const kijijiResponseStagehand = new Stagehand({
  env: "LOCAL",
});
export const kijijiStagehand = new Stagehand({
  env: "LOCAL",
});
export const craigslistStagehand = new Stagehand({
  env: "LOCAL",
});
export const shopifyStagehand = new Stagehand({
  env: "LOCAL",
});

const run = async () => {
  kijijiResponseStagehand.init();
  await runKijijiLogin(kijijiResponseStagehand);
  await respondToKijiji();
};
run();

// const client = new ConvexHttpClient(process.env.CONVEX_URL || "");

// const app = express();
// const port = process.env.PORT || 3001;

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   }),
// );

// app.use(express.json());

// const postToKijiji = async (src: string) => {
//   const listing = await client.query(api.listings.get, { src });
//   if (!listing) {
//     throw new Error("Listing not found");
//   }

//   try {
//     await postKijijiAd(src, listing.title, listing.description, listing.price);
//   } catch (error) {
//     console.error("Error posting Kijiji ad:", error);
//     throw new Error("Failed to post Kijiji ad\n" + error);
//   }

//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   let url = await kijijiStagehand.page.url();
//   console.log("Final URL:", url);

//   return url?.indexOf("posted") === -1
//     ? url
//     : url.substring(0, url.indexOf("posted"));
// };

// const postToShopify = async (src: string) => {
//   const listing = await client.query(api.listings.get, { src });
//   if (!listing) {
//     throw new Error("Listing not found");
//   }

//   try {
//     await postShopifyAd(src, listing.title, listing.description, listing.price);
//   } catch (error) {
//     console.error("Error posting Shopify ad:", error);
//     throw new Error("Failed to post Shopify ad\n" + error);
//   }

//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   let url = await shopifyStagehand.page.url();
//   console.log("Final URL:", url);

//   return url;
// };

// const postToCraigslist = async (src: string) => {
//   const listing = await client.query(api.listings.get, { src });
//   if (!listing) {
//     throw new Error("Listing not found");
//   }

//   try {
//     await postCraigsListAd(
//       src,
//       listing.title,
//       listing.description,
//       listing.price,
//     );
//   } catch (error) {
//     console.error("Error posting Craigslist ad:", error);
//     throw new Error("Failed to post Craigslist ad\n" + error);
//   }

//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   let url = await craigslistStagehand.page.url();
//   console.log("Final URL:", url);

//   return url;
// };

// // @ts-ignore
// app.post("/post-kijiji", async (req: Request, res: Response) => {
//   const { src } = req.query;
//   if (!src || typeof src !== "string") {
//     return res.status(400).json({ error: "Missing or invalid src parameter" });
//   }

//   try {
//     const url = await postToKijiji(src);
//     res.send({ url });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// // @ts-ignore
// app.post("/post-shopify", async (req: Request, res: Response) => {
//   const { src } = req.query;
//   if (!src || typeof src !== "string") {
//     return res.status(400).json({ error: "Missing or invalid src parameter" });
//   }

//   try {
//     const url = await postToShopify(src);
//     res.send({ url });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// // @ts-ignore
// app.post("/post-craigslist", async (req: Request, res: Response) => {
//   const { src } = req.query;
//   if (!src || typeof src !== "string") {
//     return res.status(400).json({ error: "Missing or invalid src parameter" });
//   }

//   try {
//     const url = await postToCraigslist(src);
//     res.send({ url });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// // @ts-ignore
// app.post("/post", async (req: Request, res: Response) => {
//   const { src } = req.query;
//   if (!src || typeof src !== "string") {
//     return res.status(400).json({ error: "Missing or invalid src parameter" });
//   }

//   try {
//     const [kijijiUrl, shopifyUrl, craigslistUrl] = await Promise.all([
//       postToKijiji(src),
//       postToShopify(src),
//       postToCraigslist(src),
//     ]);

//     res.send({
//       kijijiUrl,
//       shopifyUrl,
//       craigslistUrl,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// app.listen(port, async () => {
//   await MessageScanner();
//   console.log(`Server listening on port ${port}`);
// });
