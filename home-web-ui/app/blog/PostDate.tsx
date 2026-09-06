"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const PostDate = ({ date }: { date: string }) => {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <time dateTime={date} className="inline-block min-w-20">
      {hydrated ? new Date(date).toLocaleDateString() : ""}
    </time>
  );
};

export default PostDate;
