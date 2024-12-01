import "dotenv/config";
import { z } from "zod";
import {
  ShopifyCategory,
  ShopifyClothingCategory,
  ShopifyElectronicsCategory,
  ShopifyMusicalInstrumentCategory,
} from "types";
import { kijijiStagehand, shopifyStagehand } from "app";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export type ShopifySubCategory =
  | ShopifyElectronicsCategory
  | ShopifyMusicalInstrumentCategory
  | ShopifyClothingCategory;

const generateShopifyInfo = async (src: string) => {
  const productInfo = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          { type: "image", image: `${src}` },
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
    prompt: `Here is some information about a product: ${productInfo.text}. Based on this information, generate a Shopify listing with the following fields:
      - title: A clear, descriptive title under 40 characters
      - description: A detailed product description
      - price: A reasonable price in CAD
      - category: One of the following Shopify categories: ${Object.values(ShopifyCategory).join(", ")}
      - subcategory: If applicable, a relevant subcategory`,
    schema: z.object({
      category: z.nativeEnum(ShopifyCategory),
      subcategory: z.nativeEnum(ShopifyClothingCategory).optional(),
    }),
  });

  return response;
};

const runShopifyLogin = async () => {
  await shopifyStagehand.init({
    domSettleTimeoutMs: 40000,
    modelName: "gpt-4o",
  });
  await shopifyStagehand.page.goto(
    "https://admin.shopify.com/store/1yzxxw-m0/products/new",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await shopifyStagehand.page.fill("#account_email", "p25wang@uwaterloo.ca");
  await shopifyStagehand.act({
    action: "Click on the continue with email button",
  });
  await shopifyStagehand.page.fill(
    "#account_password",
    `${process.env.SHOPIFY_PASSWORD}`,
  );
  await shopifyStagehand.act({
    action: "click on the log in button",
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const createShopifyProduct = async (
  image: string,
  title: string,
  description: string,
  price: number,
  category: ShopifyCategory,
  subcategory: ShopifySubCategory,
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  runShopifyLogin();

  const titleBox = kijijiStagehand.page.locator(
    '[placeholder="Short sleeve t-shirt"]',
  );
  await titleBox.fill(title);

  await kijijiStagehand.page.evaluate(() => {
    const textarea = document.querySelector("#product-description");
    if (textarea) {
      textarea.removeAttribute("style");
      textarea.setAttribute("style", "display: block;");
    }
  });
  await kijijiStagehand.page.fill("#product-description", description);

  const priceBox = kijijiStagehand.page.locator('[name="price"]');
  await priceBox.fill(price.toString());

  await kijijiStagehand.act({
    action: "click on the select existing button",
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const addFromUrlBox = kijijiStagehand.page.locator(
    '[aria-label="Add from URL"]',
  );
  addFromUrlBox.click();

  const urlBox = kijijiStagehand.page.locator('[placeholder="https://"]');
  await urlBox.fill(image.toString());

  await kijijiStagehand.act({
    action: "click on the add file button",
  });

  await kijijiStagehand.act({
    action: "click on the done button",
  });

  const submitButton = kijijiStagehand.page.locator('[aria-label="Save"]');
  await submitButton.click();

  return kijijiStagehand.page.url();
};

export const postShopifyAd = async (
  src: string,
  title: string,
  description: string,
  price: number,
) => {
  const shopifyInfo = await generateShopifyInfo(src);
  const category = shopifyInfo.object.category;
  const subcategory = shopifyInfo.object.subcategory;

  createShopifyProduct(
    src,
    title,
    description,
    price,
    category,
    subcategory as ShopifySubCategory,
  );
};
