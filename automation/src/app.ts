import { Stagehand } from "@browserbasehq/stagehand";
import express, { Request, Response } from "express";
import cors from "cors";
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";
import { responder } from "kijiji.js";
import { createShopifyProduct, runShopifyLogin } from "shopify.js";
import { ShopifyCategory, ShopifySubCategory } from "types.js";

dotenv.config({ path: ".env" });

export const responderStagehand = new Stagehand({
  env: "LOCAL",
});
export const kijijiStagehand = new Stagehand({
  env: "LOCAL",
});

export const ShopifyStagehand = new Stagehand({
  env: "LOCAL",
});

const run = async () => {
  await runShopifyLogin(ShopifyStagehand);
  await createShopifyProduct(
    "product-test",
    "description-test",
    100,
    ShopifyStagehand,
    ShopifyCategory.ApparelAndAccessories,
    ShopifySubCategory.SomeTestSubCategory,
  );
};

console.log(run());

// const client = new ConvexHttpClient(process.env.CONVEX_URL || "");
// responder();

// const app = express();
// const port = process.env.PORT || 3001;

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   }),
// );

// app.use(express.json());

// app.get("/", async (_req: express.Request, res: express.Response) => {
//   console.log(await client.query(api.locations.getAll));
//   res.send("Server is running");
// });

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
