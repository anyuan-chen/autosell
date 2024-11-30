import { Stagehand } from "@browserbasehq/stagehand";
import express from "express";
import cors from "cors";
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";
import { responder } from "kijiji.js";
import { runCraigsListLogin, postCraigsListAd } from "craiglist.js";
import { CraigsListPostDetails, CraigsListSaleCategory } from "types.js";

dotenv.config({ path: ".env.local" });

export const craiglistStagehand = new Stagehand({
  env: "LOCAL"
})

const postDetails: CraigsListPostDetails = {
  postingTitle: "peter's big stick",
  price: 999,
  zipCode: "N6A 3K7:",
  description: "lalalalalal no description needed"
}

const run = async () => {
 await runCraigsListLogin(craiglistStagehand)
 await postCraigsListAd("https://www.uwo.ca/img/about/bnr/about_western_mobile.jpg", craiglistStagehand, CraigsListSaleCategory.MusicalInstruments, postDetails)
}

run()