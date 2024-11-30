import "dotenv/config";
import * as path from "path";
import { z } from "zod";
import fs from "fs";
import { Stagehand } from "@browserbasehq/stagehand";
import { Locator } from "playwright-core";
import { kijijiStagehand, kijijiResponseStagehand } from "app";
import {
  KijijiCategory,
  KijijiClothingCategory,
  KijijiMusicalInstrumentCategory,
} from "types";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export type KijijiSubcategory =
  | KijijiClothingCategory
  | KijijiMusicalInstrumentCategory;

const NegotiationPrompt = `
  You are a top negotiator. Make sure the sale is done, at a reasonable price. Come up with the next message in this negotiation. Be very concise and try not to sound like a bot. I will pretend to negotiate with you and after every response, I want you to tell me what stage of the negotiation we are currently in out of the following categories! 
  export enum NegotiationStage { 
    Preliminary = "Preliminary", 
    PriceNegotiation = "Price Negotiation", 
    Deal = "Deal", 
    Meetup = "Meetup", 
  } 
  Let's say you are selling airpods pro for 250 dollars. Make sure you don't go below 225 dollars. 
  After you guys agree on a price, suggest places to meetup for the sale. 
  Let the roleplay begin`;

const generateKijijiInfo = async (src: string) => {
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
    prompt: `Here is some information about a product: ${productInfo.text}. Based on this information, generate a Kijiji listing with the following fields:
    - title: A clear, descriptive title under 40 characters
    - description: A detailed product description
    - price: A reasonable price in CAD
    - category: One of the following Kijiji categories: ${Object.values(KijijiCategory).join(", ")}
    - subcategory: If applicable, a relevant subcategory`,
    schema: z.object({
      category: z.nativeEnum(KijijiCategory),
      subcategory: z.nativeEnum(KijijiMusicalInstrumentCategory).optional(),
    }),
  });

  return response;
};

export const runKijijiLogin = async (stagehand: Stagehand) => {
  await stagehand.init({ domSettleTimeoutMs: 40000 });
  await stagehand.page.goto(
    "https://id.kijiji.ca/login?service=https%3A%2F%2Fid.kijiji.ca%2Foauth2.0%2FcallbackAuthorize%3Fclient_id%3Dkijiji_horizontal_web_gpmPihV3%26redirect_uri%3Dhttps%253A%252F%252Fwww.kijiji.ca%252Fapi%252Fauth%252Fcallback%252Fcis%26response_type%3Dcode%26client_name%3DCasOAuthClient&locale=en&state=SteMlbjWnFA0Q1E2yVPRw9Pv0KSwaCNECrjy6DGrq20&scope=openid+email+profile",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await stagehand.page.fill("#username", "andrew.chen.anyuan@gmail.com");
  await stagehand.page.fill("#password", `${process.env.KIJIJI_PASSWORD}`);
  await stagehand.page.click("#login-submit");
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const createKijijiAd = async (
  src: string,
  title: string,
  description: string,
  price: number,
  category: KijijiCategory,
  subcategory: KijijiSubcategory,
) => {
  if (title.length < 7) {
    throw new Error("title too short");
  }
  await kijijiStagehand.page.goto(
    "https://www.kijiji.ca/p-select-category.html",
  );
  await new Promise((resolve) => setTimeout(resolve, 200));
  await kijijiStagehand.page.fill("#AdTitleForm", title);
  await kijijiStagehand.page.getByText("Next").click();
  await new Promise((resolve) => setTimeout(resolve, 300));
  const buyAndSell = await kijijiStagehand.page.getByText("Buy & Sell");

  let buyAndSellButton;
  for (const element of await buyAndSell.all()) {
    if (!(await element.getAttribute("class"))?.includes("pathBreadcrumb")) {
      buyAndSellButton = element;
      await buyAndSellButton.click();
      break;
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
  let categoryButton;
  const categoryText = await kijijiStagehand.page.getByText(category);
  for (const element of await categoryText.all()) {
    if (!(await element.getAttribute("class"))?.includes("pathBreadcrumb")) {
      categoryButton = element;
      await categoryButton.click();
      break;
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (subcategory) {
    await kijijiStagehand.act({ action: `click on the ${subcategory} button` });
  }
  await kijijiStagehand.page.fill("#pstad-descrptn", description);
  const fileChooserPromise = kijijiStagehand.page.waitForEvent("filechooser");
  const response = await fetch(src);
  const buffer = await response.arrayBuffer();
  const tempFile = path.join(process.cwd(), `temp-${Date.now()}.jpg`);
  await fs.promises.writeFile(tempFile, Buffer.from(buffer));
  await kijijiStagehand.page.getByText("Select Images").click();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const fileChooser = await fileChooserPromise;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await fileChooser.setFiles(tempFile);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await fs.promises.unlink(tempFile);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await kijijiStagehand.page.fill("#PriceAmount", price.toString());
  const submitButtons = await kijijiStagehand.page
    .locator('button[type="submit"]')
    .all();
  for (const button of submitButtons) {
    const buttonText = await button.textContent();
    if (buttonText?.toLowerCase().includes("post your ad")) {
      await button.click();
      break;
    }
  }
};

const respondToKijiji = async () => {
  const url = await kijijiResponseStagehand.page.url();
  await new Promise((resolve) => setTimeout(resolve, 4000));
  console.log(url);
};

const messageScanner = async () => {
  const currentUrl = await kijijiResponseStagehand.page.url();
  if (currentUrl !== "https://www.kijiji.ca/m-msg-my-messages/") {
    await kijijiResponseStagehand.page.goto(
      "https://www.kijiji.ca/m-msg-my-messages/",
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  const listParent = await kijijiResponseStagehand.page.locator(
    `[data-testid="conversation-list"]`,
  );

  const conversations = await listParent.locator(`:scope > *`).all();
  const hasUnreadMessages = async (element: Locator) => {
    const unreadDots = await element.locator(`[class*="unreadDot"]`).all();
    if (unreadDots.length > 0) {
      return true;
    }
    const children = await element.locator(`:scope > *`).all();
    for (const child of children) {
      if (await hasUnreadMessages(child)) {
        return true;
      }
    }
    return false;
  };

  for (const conversation of conversations) {
    if (await hasUnreadMessages(conversation)) {
      await conversation.click({
        modifiers: ["Meta"],
      });
      await kijijiResponseStagehand.page.context().waitForEvent("page");
      const pages = kijijiResponseStagehand.page.context().pages();
      const newPage = pages[pages.length - 1];
      await newPage.waitForLoadState();
      const originalPage = kijijiResponseStagehand.page;
      kijijiResponseStagehand.page = newPage;
      await respondToKijiji();
      await newPage.close();
      kijijiResponseStagehand.page = originalPage;
      await new Promise((resolve) => setTimeout(resolve, 500));
      break;
    }
  }
};

export const postKijijiAd = async (
  src: string,
  title: string,
  description: string,
  price: number,
) => {
  const kijijiInfo = await generateKijijiInfo(src);
  const category = kijijiInfo.object.category;
  const subcategory = kijijiInfo.object.subcategory;

  createKijijiAd(
    src,
    title,
    description,
    price,
    category,
    subcategory as KijijiSubcategory,
  );
};

export async function responder() {
  await messageScanner();
  setTimeout(responder, 1000);
}
