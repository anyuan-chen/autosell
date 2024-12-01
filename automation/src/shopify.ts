import "dotenv/config";
import { shopifyStagehand } from "app";


export const runShopifyLogin = async () => {
  await shopifyStagehand.init({
    domSettleTimeoutMs: 40000,
    modelName: "gpt-4o",
  });
  await shopifyStagehand.page.goto(
    "https://admin.shopify.com/store/p310pm-c4/products/new",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await shopifyStagehand.page.fill(
    "#account_email",
    `${process.env.SHOPIFY_EMAIL}`,
  );
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
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const titleBox = shopifyStagehand.page.locator(
    '[placeholder="Short sleeve t-shirt"]',
  );
  await titleBox.fill(title);

  await shopifyStagehand.page.evaluate(() => {
    const textarea = document.querySelector("#product-description");
    if (textarea) {
      textarea.removeAttribute("style");
      textarea.setAttribute("style", "display: block;");
    }
  });
  await shopifyStagehand.page.fill("#product-description", description);

  const priceBox = shopifyStagehand.page.locator('[name="price"]');
  await priceBox.fill(price.toString());

  await shopifyStagehand.act({
    action: "click on the select existing button",
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const addFromUrlBox = shopifyStagehand.page.locator(
    '[aria-label="Add from URL"]',
  );
  addFromUrlBox.click();

  const urlBox = shopifyStagehand.page.locator('[placeholder="https://"]');
  await urlBox.fill(image.toString());

  await shopifyStagehand.act({
    action: "click on the add file button",
  });

  await shopifyStagehand.act({
    action: "click on the done button",
  });

  const submitButton = shopifyStagehand.page.locator('[aria-label="Save"]');
  await submitButton.click();

  return shopifyStagehand.page.url();
};

export const postShopifyAd = async (
  src: string,
  title: string,
  description: string,
  price: number,
) => {
  return await createShopifyProduct(
    src,
    title,
    description,
    price,
  );
};
