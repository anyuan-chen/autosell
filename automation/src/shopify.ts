import "dotenv/config";
import { shopifyStagehand } from "app";
import * as path from "path"
import fs from 'fs'

export const runShopifyLogin = async () => {
  await shopifyStagehand.init({
    domSettleTimeoutMs: 40000,
  });

  await shopifyStagehand.page.goto(`${process.env.SHOPIFY_STORE_LINK}`);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await shopifyStagehand.page.fill(
    "#account_email",
    `${process.env.SHOPIFY_EMAIL}`,
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await shopifyStagehand.page.click('button[name="commit"]');

  console.log("clicking log in with email button");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await shopifyStagehand.page.fill(
    "#account_password",
    `${process.env.SHOPIFY_PASSWORD}`,
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await shopifyStagehand.page.click('button[name="commit"]');

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



  

  const tempFile = path.join(process.cwd(), `temp-${Date.now()}.jpg`)
  const response = await fetch(image);
  const buffer = await response.arrayBuffer()

  const fileChooserPromise = shopifyStagehand.page.waitForEvent('filechooser')
  await fs.promises.writeFile(tempFile, Buffer.from(buffer))
  await new Promise((resolve) => setTimeout(resolve, 1000))

  await shopifyStagehand.act({
    action: `click on the "upload new" button`,
  });
  
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const fileChooser = await fileChooserPromise
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await fileChooser.setFiles(tempFile)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  await fs.promises.unlink(tempFile)

  const submitButton = shopifyStagehand.page.locator('[aria-label="Save"]');
  await submitButton.click();

  const previewButton = shopifyStagehand.page
    .locator('[aria-label="Preview on Online Store"]')
    .nth(1);

  console.log(previewButton);
  const innerHTML = previewButton.innerHTML();
  console.log("inner html: ", innerHTML);

  const innerText = previewButton.innerText();
  console.log("inner text: ", innerText);

  await previewButton.click();

  return shopifyStagehand.page.url();
};

export const postShopifyAd = async (
  src: string,
  title: string,
  description: string,
  price: number,
) => {
  return await createShopifyProduct(src, title, description, price);
};
