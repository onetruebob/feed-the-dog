import { User } from "@prisma/client";
import { format, startOfDay } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { db } from "./db.server";
import { updateTidbyt } from "./tidbyt.server";

export interface LastFedInfo {
  fedTodayCount: number;
  lastFed: string;
}

export async function getLastFedInfo(userId: User["id"]): Promise<LastFedInfo> {
  const todayStart = startOfDayZoned(new Date(), "America/New_York");
  console.log({ todayStart });
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
  const srcDateInTz = utcToZonedTime(srcDate, "America/New_York");
  if (startOfDayZoned(new Date(), "America/New_York") < srcDateInTz) {
    return format(srcDateInTz, "h:mm a");
  }
  return "Not today";
}

export async function feedNow(userId: User["id"]): Promise<void> {
  await db.feedHistory.create({ data: { userId } });
  const LastFedInfo = await getLastFedInfo(userId);
  updateTidbyt(LastFedInfo);
}

export async function removeLastFed(userId: User["id"]): Promise<void> {
  const recentFeeding = await db.feedHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (recentFeeding) {
    await db.feedHistory.delete({ where: { id: recentFeeding.id } });
  }
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

export async function fedStatus(userId: User["id"]): Promise<string> {
  const lastFedInfo = await getLastFedInfo(userId);
  updateTidbyt(lastFedInfo); // Don't wait to respond

  if (lastFedInfo.fedTodayCount === 0) {
    return "The dog has not been fed today.";
  }

  return `The dog has been fed ${pluralize(
    lastFedInfo.fedTodayCount,
    "time"
  )} today. The last time was at ${lastFedInfo.lastFed}.`;
}

function startOfDayZoned(dateGMT: Date, timezone: string): Date {
  return zonedTimeToUtc(
    startOfDay(utcToZonedTime(dateGMT, timezone)),
    timezone
  );
}

const pluralize = (count: number, noun: string, suffix = "s") =>
  `${count} ${noun}${count !== 1 ? suffix : ""}`;
