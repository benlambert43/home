"use client";

import { useHydrated } from "@/app/lib/useHydrated";

const SITE_LOCALE = "en-US";

const SITE_TIME_ZONE = "America/Denver";

const formatDate = (date: string, locale?: string, timeZone?: string) =>
  new Date(date).toLocaleDateString(locale, { dateStyle: "medium", timeZone });

const PostDate = ({ date }: { date: string }) => {
  const hydrated = useHydrated();

  return (
    <time dateTime={date}>
      {hydrated
        ? formatDate(date)
        : formatDate(date, SITE_LOCALE, SITE_TIME_ZONE)}
    </time>
  );
};

export default PostDate;
