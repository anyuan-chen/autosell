import { Stagehand } from "@browserbasehq/stagehand";
import * as path from "path";
import fs from "fs";
import { CraigsListSaleCategory, CraigsListPostDetails } from "types";
import { prisma } from "app";

export const runCraigsListLogin = async (stagehand: Stagehand) => {
  await stagehand.init({ domSettleTimeoutMs: 40000 });
  await stagehand.page.goto("https://accounts.craigslist.org/login");

  const email = process.env.CRAIGLIST_USERNAME ?? "";
  const password = process.env.CRAIGLIST_PASSWORD ?? "";

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await stagehand.page.fill("#inputEmailHandle", email);
  await stagehand.page.fill("#inputPassword", password);
  await stagehand.page.click("#login");
  await new Promise((resolve) => setTimeout(resolve, 2000));
};

export const postCraigsListAd = async (
  src: string,
  stagehand: Stagehand,
  category: CraigsListSaleCategory,
) => {
  const listing = await prisma.listing.findFirst({
    where: {
      src,
    },
  });
  if (!listing) {
    throw new Error("Listing not found");
  }

  const postDetails: CraigsListPostDetails = {
    postingTitle: listing.title,
    description: listing.description,
    price: listing.price,
  };

  await stagehand.page.waitForSelector(
    'form[class="new_posting_thing"] > button',
  );

  await stagehand.page.click('form[class="new_posting_thing"] > button'); // open up a new posting
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await stagehand.page.uncheck('input[name="same_category"]');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await stagehand.page.click('button[class="continue pickbutton"]');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await stagehand.page.click('input[value="fso"]');
  await stagehand.page.click('input[value="98"]');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await stagehand.page.fill(
    'input[name="PostingTitle"]',
    postDetails.postingTitle,
  );
  await stagehand.page.fill(
    'input[name="price"]',
    postDetails.price.toString(),
  );
  await stagehand.page.fill(
    'textarea[name="PostingBody"]',
    postDetails.description,
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await stagehand.page.click('button[class="go big-button submit-button"]');

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await stagehand.page.click('button[class="continue bigbutton"]');

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const tempFile = path.join(process.cwd(), `temp-${Date.now()}.jpg`);
  const response = await fetch(src);
  const buffer = await response.arrayBuffer();

  const fileChooserPromise = stagehand.page.waitForEvent("filechooser");

  await fs.promises.writeFile(tempFile, Buffer.from(buffer));
  await stagehand.page.click('button[class="newupl"]');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const fileChooser = await fileChooserPromise;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await fileChooser.setFiles(tempFile);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await fs.promises.unlink(tempFile);

  await stagehand.page.click('button[class="done bigbutton"]');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await stagehand.page.click('form[id="publish_top"] > button');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await stagehand.act({
    action:
      "click on the link that goes to the posting we just made. should be the second line",
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
