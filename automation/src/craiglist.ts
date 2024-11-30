import { Stagehand } from "@browserbasehq/stagehand";
import { CraigsListSaleCategory, CraigsListPostDetails } from "types";

export const runCraigsListLogin  = async (stagehand: Stagehand) => {
    await stagehand.init({ domSettleTimeoutMs: 40000 });
    await stagehand.page.goto(
        "https://accounts.craigslist.org/login"
    );

    const email = process.env.CRAIGLIST_USERNAME ?? ""
    const password = process.env.CRAIGLIST_PASSWORD ?? ""

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await stagehand.page.fill("#inputEmailHandle", email);
    await stagehand.page.fill("#inputPassword", password);
    await stagehand.page.click("#login");
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const postCraigsListAd = async (
    stagehand: Stagehand,
    category: CraigsListSaleCategory,
    postDetails: CraigsListPostDetails
) => {
    await stagehand.page.click("#submit");
}
  