import { exec } from "child_process";
import { LastFedInfo } from "./feedingHistory.server";

export async function updateTidbyt(data: LastFedInfo): Promise<void> {
  const renderCommand = getRenderCommand(JSON.stringify(data));
  const pushCommand = getPushCommand();
  await execPromise(renderCommand);
  await execPromise(pushCommand);
}

function getRenderCommand(data: string): string {
  return `pixlet render app/tidbyt/feed-the-dog.star data='${data}'`;
}

function getPushCommand(): string {
  return `pixlet push --api-token ${process.env.TIDBYT_API_KEY} --installation-id FeedTheDog ${process.env.TIDBYT_DEVICE_ID} app/tidbyt/feed-the-dog.webp`;
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
