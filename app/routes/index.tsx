import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  feedNow,
  getLastFedInfo,
  removeLastFed,
} from "~/utils/feedingHistory.server";
import { requireUserId } from "~/utils/session.server";

interface LoaderData {
  fedTodayCount: number;
  lastFed: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const lastFedInfo = await getLastFedInfo(userId);
  return json(lastFedInfo);
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const method = formData.get("_method");
  if (method === "feed") {
    await feedNow(userId);
  }
  if (method === "remove-last") {
    removeLastFed(userId);
  }
  return json({}, 200);
};

export default function Index() {
  const { fedTodayCount, lastFed } = useLoaderData<LoaderData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>🐶 Fed the dog</h1>
      <ul>
        <li>Fed: {fedTodayCount}</li>
        <li>Last: {lastFed}</li>
      </ul>
      <Form method="post">
        <input type="hidden" name="_method" value="feed" />
        <button type="submit">Feed now</button>
      </Form>
      <Form method="post">
        <input type="hidden" name="_method" value="remove-last" />
        <button type="submit">Remove last</button>
      </Form>
    </div>
  );
}
