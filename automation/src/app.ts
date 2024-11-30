import { Stagehand } from "@browserbasehq/stagehand";
import express from "express";

export const responderStagehand = new Stagehand({
  env: "LOCAL",
});
export const kijijiStagehand = new Stagehand({
  env: "LOCAL",
});


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req: express.Request, res: express.Response) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
