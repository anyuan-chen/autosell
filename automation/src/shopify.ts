import "dotenv/config";
import * as path from "path";
import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import { Locator } from "playwright-core";
import { kijijiStagehand, responderStagehand } from "app";
import { ShopifyCategory, ShopifySubCategory } from "types";

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
  stagehand: Stagehand,
  category: ShopifyCategory,
  subcategory: ShopifySubCategory,
) => {
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

  const submitButton = stagehand.page.locator('[aria-label="Save"]');
  await submitButton.click();

  return stagehand.page.url();
};
