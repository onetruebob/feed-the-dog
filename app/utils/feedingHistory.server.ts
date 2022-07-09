import { User } from "@prisma/client";
import { formatDistanceToNowStrict, isToday, startOfToday } from "date-fns";
import { db } from "./db.server";

interface LastFedInfo {
  fedTodayCount: number;
  lastFed: string;
}

export async function getLastFedInfo(userId: User["id"]): Promise<LastFedInfo> {
  const todayStart = startOfToday();
  const fedTodayCount = await db.feedHistory.count({
    where: { userId, createdAt: { gte: todayStart } },
  });

  const lastFeedingEntry = await db.feedHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const lastFed = dateToString(lastFeedingEntry?.createdAt);

  return {
    fedTodayCount,
    lastFed,
  };
}

function dateToString(srcDate: Date | undefined): string {
  if (!srcDate) {
    return "Never";
  }
  if (isToday(srcDate)) {
    return formatDistanceToNowStrict(srcDate);
  }
  return "Not today";
}

export async function feedNow(userId: User["id"]): Promise<void> {
  await db.feedHistory.create({ data: { userId } });
}
