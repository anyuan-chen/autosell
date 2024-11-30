import "dotenv/config";
import * as path from "path";
import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import { Locator } from "playwright-core";
import { ShopifyCategory, ShopifySubCategory } from "types";
import fetch from "node-fetch";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

export const runShopifyLogin = async (stagehand: Stagehand) => {
  await stagehand.init({ domSettleTimeoutMs: 40000, modelName: "gpt-4o" });
  await stagehand.page.goto(
    "https://admin.shopify.com/store/1yzxxw-m0/products/new",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await stagehand.page.fill("#account_email", "whcpeterwangca@gmail.com");
  await stagehand.act({
    action: "Click on the continue with email button",
  });
  await stagehand.page.fill(
    "#account_password",
    `${process.env.SHOPIFY_PASSWORD}`,
  );
  await stagehand.act({
    action: "click on the log in button",
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const createShopifyProduct = async (
  title: string,
  description: string,
  price: number,
  image: URL,
  stagehand: Stagehand,
  category: ShopifyCategory,
  subcategory: ShopifySubCategory,
) => {
  //   const downloadImage = async (image_url: URL | string) => {
  //     const url =
  //       typeof image_url === "string" ? image_url : image_url.toString();

  //     if (!url.startsWith("http://") && !url.startsWith("https://")) {
  //       throw new Error("Invalid URL: Only HTTP(S) protocols are supported");
  //     }

  //     const response = await fetch(url);
  //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  //     const buffer = await response.buffer();
  //     const imagePath = path.join("product_image.webp");

  //     fs.writeFileSync(imagePath, buffer);
  //     console.log(`Image saved to ${imagePath}`);
  //   };

  //   downloadImage(image).catch(console.error);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const titleBox = stagehand.page.locator(
    '[placeholder="Short sleeve t-shirt"]',
  );
  await titleBox.fill(title);

  await stagehand.page.evaluate(() => {
    const textarea = document.querySelector("#product-description");
    if (textarea) {
      textarea.removeAttribute("style");
      textarea.setAttribute("style", "display: block;");
    }
  });
  await stagehand.page.fill("#product-description", description);

  const priceBox = stagehand.page.locator('[name="price"]');
  await priceBox.fill(price.toString());

  await stagehand.act({
    action: "click on the select existing button",
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const addFromUrlBox = stagehand.page.locator('[aria-label="Add from URL"]');
  addFromUrlBox.click();

  const urlBox = stagehand.page.locator('[placeholder="https://"]');
  await urlBox.fill(image.toString());

  await stagehand.act({
    action: "click on the add file button",
  });

  await stagehand.act({
    action: "click on the done button",
  });

  const submitButton = stagehand.page.locator('[aria-label="Save"]');
  await submitButton.click();

  return stagehand.page.url();
};
