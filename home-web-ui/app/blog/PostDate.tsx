"use client";

import { useHydrated } from "@/app/lib/useHydrated";

const PostDate = ({ date }: { date: string }) => {
  const hydrated = useHydrated();

  return (
    <time dateTime={date} className="inline-block min-w-20">
      {hydrated ? new Date(date).toLocaleDateString() : ""}
    </time>
  );
};

export default PostDate;
