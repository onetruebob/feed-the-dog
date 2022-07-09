import { ActionFunction, json } from "@remix-run/node";
import { requireValidCronToken } from "~/utils/cron.server";
import { maybeResetHistories } from "~/utils/feedingHistory.server";

export const action: ActionFunction = async ({ request }) => {
  await requireValidCronToken(request);
  await maybeResetHistories();
  return json({}, 200);
};
