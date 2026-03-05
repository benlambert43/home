"use client";

import { BellIcon } from "@heroicons/react/16/solid";

export const Notifications = () => {
  return (
    <div>
      <div className="relative">
        <BellIcon className="size-6" />
        <span
          className="absolute top-0 right-0 block h-2 w-2 rounded-full
            bg-red-400 ring-1 ring-white"
        />
      </div>
    </div>
  );
};
