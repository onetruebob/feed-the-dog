import { ActionFunction, json } from "@remix-run/node";
import { fedStatus } from "~/utils/feedingHistory.server";
import { login, LoginForm } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const loginData: LoginForm = await request.json();
  const user = await login(loginData);
  if (!user) {
    return json({}, 401);
  }
  const reply = await fedStatus(user.id);
  return json({ reply }, 200);
};
