import "dotenv/config";
import * as path from "path";
import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import { Locator } from "playwright-core";
import { kijijiStagehand, responderStagehand } from "app";

type KijijiSubcategory =
  | KijijiClothingCategory
  | KijijiMusicalInstrumentCategory;

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
};

const postKijijiAd = async (
  title: string,
  description: string,
  price: number,
  category: KijijiCategory,
  subcategory?: KijijiSubcategory,
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
  const fileInput = kijijiStagehand.page.locator('input[type="file"]');
  await fileInput.setInputFiles(path.join(__dirname, "sample.jpg"));
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
      "https://www.kijiji.ca/m-msg-my-messages/",
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  const listParent = await responderStagehand.page.locator(
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
