import { User } from "@prisma/client";
import { format, isToday, startOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { db } from "./db.server";
import { updateTidbyt } from "./tidbyt.server";

export interface LastFedInfo {
  fedTodayCount: number;
  lastFed: string;
}

export async function getLastFedInfo(userId: User["id"]): Promise<LastFedInfo> {
  const todayStart = startOfDay(utcToZonedTime(new Date(), "America/New_York"));
  const fedTodayCount = await db.feedHistory.count({
    where: { userId, createdAt: { gte: todayStart } },
  });

  const lastFeedingEntry = await db.feedHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const lastFed = dateToString(
    lastFeedingEntry?.createdAt &&
      utcToZonedTime(lastFeedingEntry?.createdAt, "America/New_York")
  );

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
    return format(srcDate, "h:mm a");
  }
  return "Not today";
}

export async function feedNow(userId: User["id"]): Promise<void> {
  await db.feedHistory.create({ data: { userId } });
  const LastFedInfo = await getLastFedInfo(userId);
  updateTidbyt(LastFedInfo);
}

export async function maybeResetHistories(): Promise<void> {
  const users = await await db.user.findMany({ select: { id: true } });
  const userIds = users.map(({ id }) => id);

  for (const userId of userIds) {
    const lastFedInfo = await getLastFedInfo(userId);
    if (lastFedInfo.fedTodayCount === 0) {
      await updateTidbyt(lastFedInfo);
    }
  }
}
