import "dotenv/config";
import * as path from "path";
import { z } from "zod";
import fs from "fs";
import { Stagehand } from "@browserbasehq/stagehand";
import { Locator } from "playwright-core";
import { client, kijijiResponseStagehand, kijijiStagehand } from "app";
import {
  KijijiCategory,
  KijijiClothingCategory,
  KijijiMusicalInstrumentCategory,
} from "types";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { api } from "../convex/_generated/api";

export type KijijiSubcategory =
  | KijijiClothingCategory
  | KijijiMusicalInstrumentCategory;

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
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await stagehand.page.fill("#username", "p25wang@uwaterloo.ca");
  await stagehand.page.fill("#password", `${process.env.KIJIJI_PASSWORD}`);
  await stagehand.page.click("#login-submit");
  await new Promise((resolve) => setTimeout(resolve, 3000));
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

export const respondToKijiji = async () => {
  // Find the link by looking for elements with class containing 'adLink'
  const adLink = await kijijiResponseStagehand.page
    .locator('a[class*="adLink"]')
    .getAttribute("href");

  if (!adLink) {
    throw new Error("no adLink found on the page");
  }

  const listing = await client.query(api.listings.getByKijijiLink, {
    kijijiLink: adLink,
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  await kijijiResponseStagehand.page.goto(adLink);

  await new Promise((resolve) => setTimeout(resolve, 10000));
  const incoming: string[] = [];
  const outgoing: string[] = [];
  const allMessages: [string, boolean][] = [];

  console.log("was here");

  // const priceBox = kijijiResponseStagehand.page.locator(
  //   '[data-testid="AdTitle"]',
  // );
  // const priceChildDivs = priceBox.locator("div");
  // const count = await priceChildDivs.count();
  // console.log("found the div with count: ", count);

  // const priceGrandchildDiv = priceChildDivs.nth(0);
  // console.log("found the grandchild div: ", priceGrandchildDiv);
  // const priceText = await priceGrandchildDiv.textContent();
  // console.log("found the text");

  // // const listingPrice = parseFloat(priceChildText || "0");
  // // const minPrice = listingPrice * 0.9;

  // console.log("Price Child: ", priceText);
  // // console.log("Price: ", listingPrice);
  // // console.log("minPrice: ", minPrice);

  const headerWithAvatar = kijijiResponseStagehand.page.locator(
    'div[class*="headerWithAvatar"]',
  );
  const avatarLink = headerWithAvatar.locator('a[class*="avatarLink"]');
  const avatarHref = await avatarLink.getAttribute("href");

  const messageBox = kijijiResponseStagehand.page.locator(
    '[data-testid="MessageList"]',
  );

  const childrenDivs = messageBox.locator("div[data-qa-message-direction]");
  const messageCount = await childrenDivs.count();
  console.log("count is: ", messageCount);

  for (let i = 0; i < messageCount; i++) {
    console.log("was here ", i);
    const nthChild = childrenDivs.nth(i);
    const innerDivs = nthChild.locator("div");

    const innerDiv = innerDivs.nth(1);
    const textContent = await innerDiv.textContent();

    if (!textContent) {
      continue;
    }

    const direction = await nthChild.getAttribute("data-qa-message-direction");
    console.log(
      `${i}th message is: ${textContent} and the direction is ${direction}`,
    );
    if (direction == "INBOUND") {
      incoming.push(textContent);
    } else {
      outgoing.push(textContent);
    }

    allMessages.push([textContent, direction == "INBOUND" ? true : false]);
  }

  const locations = await client.query(api.locations.getAll);

  const NegotiationPrompt = `
      You are a top negotiator. Make sure the sale is done, at a reasonable price. Come up with the next message in this negotiation. Be very concise and try not to sound like a bot. 
      Here is the conversation up to this point in chronological order, where True means a message the buyer sent, and false means a message that we have already sent.
      This is some information about the product that you are selling ${JSON.stringify(listing)}.

      After you guys agree on a price, suggest places to meetup for the sale. There is a high preference on locations in ${locations}. 
      This is the conversation ${allMessages}, please respond to the latest message.
    `;

  const response = await generateText({
    model: openai("gpt-4o"),
    prompt: NegotiationPrompt,
  });
  enum NegotiationStage {
    Preliminary = "Preliminary",
    PriceNegotiation = "Price Negotiation",
    Deal = "Deal",
    Meetup = "Meetup",
  }
  const status = await generateObject({
    model: openai("gpt-4o"),
    prompt: `Based on the conversation ${allMessages}, which stage is this negotiation in?`,
    schema: z.object({
      stage: z.nativeEnum(NegotiationStage),
    }),
  });

  const name = await kijijiResponseStagehand.page
    .locator('a[class*="link"][href*="profile"]')
    .innerText();

  const lead = await client.mutation(api.leads.upsert, {
    kijijiLink: adLink,
    name: name,
    status: status.object.stage,
    messageLogs: JSON.stringify(allMessages),
  });

  console.log(lead);

  if (response.text) {
    const result = await response.text;
    console.log(result);
  } else {
    console.log("Unexpected response format:", response);
  }

  console.log("Incoming messages:", incoming);
  console.log("Outgoing messages:", outgoing);
  console.log("All messages:", allMessages);

  const messages = response.text.split("\n");
  await kijijiResponseStagehand.page.fill("#SendMessageForm", messages[0]);

  const sendButton = kijijiResponseStagehand.page.locator(
    '[data-testid="SendMessage"]',
  );
  await sendButton.click();
};

export const MessageScanner = async () => {
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

  return await createKijijiAd(
    src,
    title,
    description,
    price,
    category,
    subcategory as KijijiSubcategory,
  );
};

export async function responder() {
  await respondToKijiji();
  setTimeout(responder, 1000);
}
