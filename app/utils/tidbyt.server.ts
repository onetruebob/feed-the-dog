import { exec } from "child_process";
import { LastFedInfo } from "./feedingHistory.server";
import fs from "fs/promises";
const Tidbyt = require("tidbyt");
const tidbytDeviceId = process.env.TIDBYT_DEVICE_ID;
const tidbytApiKey = process.env.TIDBYT_API_KEY;
const tidbyt = new Tidbyt(tidbytApiKey);

export async function updateTidbyt(data: LastFedInfo): Promise<void> {
  const renderCommand = getRenderCommand(JSON.stringify(data));
  await execPromise(renderCommand);
  await pushTidbytImage("app/tidbyt/feed-the-dog.webp");
}

async function pushTidbytImage(imagePath: string) {
  const tidbytDevice = await tidbyt.devices.get(tidbytDeviceId);
  const imageBuffer = await fs.readFile(imagePath);
  await tidbytDevice.push(imageBuffer, {
    installationID: "FeedTheDogApp01",
    background: false,
  });
}

function getRenderCommand(data: string): string {
  return `pixlet render app/tidbyt/feed-the-dog.star data='${data}'`;
}

function execPromise(command: string): Promise<string> {
  return new Promise((res, rej) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        rej(error);
        return;
      }

      if (stderr) {
        rej(stderr);
        return;
      }

      res(stdout);
    });
  });
}
