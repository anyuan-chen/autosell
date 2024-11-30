import "dotenv/config";
import * as path from "path";
import { z } from "zod";
import fs from 'fs'
import { Stagehand } from "@browserbasehq/stagehand";
import { Locator } from "playwright-core";
import { kijijiStagehand, responderStagehand } from "app";
import { KijijiCategory, KijijiClothingCategory, KijijiMusicalInstrumentCategory } from "types";

export type KijijiSubcategory =
  | KijijiClothingCategory
  | KijijiMusicalInstrumentCategory;

export const runKijijiLogin = async (stagehand: Stagehand) => {
  await stagehand.init({ domSettleTimeoutMs: 40000 });
  await stagehand.page.goto(
    "https://id.kijiji.ca/login?service=https%3A%2F%2Fid.kijiji.ca%2Foauth2.0%2FcallbackAuthorize%3Fclient_id%3Dkijiji_horizontal_web_gpmPihV3%26redirect_uri%3Dhttps%253A%252F%252Fwww.kijiji.ca%252Fapi%252Fauth%252Fcallback%252Fcis%26response_type%3Dcode%26client_name%3DCasOAuthClient&locale=en&state=SteMlbjWnFA0Q1E2yVPRw9Pv0KSwaCNECrjy6DGrq20&scope=openid+email+profile"
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await stagehand.page.fill("#username", "andrew.chen.anyuan@gmail.com");
  await stagehand.page.fill("#password", `${process.env.KIJIJI_PASSWORD}`);
  await stagehand.page.click("#login-submit");
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const postKijijiAd = async (
  src: string,
  title: string,
  description: string,
  price: number,
  category: KijijiCategory,
  subcategory?: KijijiSubcategory
) => {
  if (title.length < 7) {
    throw new Error("title too short");
  }
  await kijijiStagehand.page.goto(
    "https://www.kijiji.ca/p-select-category.html"
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
  const fileChooserPromise = kijijiStagehand.page.waitForEvent('filechooser');
  const response = await fetch(src);
  const buffer = await response.arrayBuffer();
  const tempFile = path.join(process.cwd(), `temp-${Date.now()}.jpg`);
  await fs.promises.writeFile(tempFile, Buffer.from(buffer));
  await kijijiStagehand.page.getByText('Select Images').click();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const fileChooser = await fileChooserPromise;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await fileChooser.setFiles(tempFile);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // await fs.promises.unlink(tempFile); 
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
  const url = await responderStagehand.page.url();
  await new Promise((resolve) => setTimeout(resolve, 4000));
  console.log(url);
};

const messageScanner = async () => {
  const currentUrl = await responderStagehand.page.url();
  if (currentUrl !== "https://www.kijiji.ca/m-msg-my-messages/") {
    await responderStagehand.page.goto(
      "https://www.kijiji.ca/m-msg-my-messages/"
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  const listParent = await responderStagehand.page.locator(
    `[data-testid="conversation-list"]`
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
      await responderStagehand.page.context().waitForEvent("page");
      const pages = responderStagehand.page.context().pages();
      const newPage = pages[pages.length - 1];
      await newPage.waitForLoadState();
      const originalPage = responderStagehand.page;
      responderStagehand.page = newPage;
      await respondToKijiji();
      await newPage.close();
      responderStagehand.page = originalPage;
      await new Promise((resolve) => setTimeout(resolve, 500));
      break;
    }
  }
};

export async function responder() {
  await messageScanner();
  setTimeout(responder, 10000);
}
