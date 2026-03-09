"use client";

import { BellIcon } from "@heroicons/react/16/solid";

export const Notifications = () => {
  return (
    <div>
      <div className="relative">
        <BellIcon className="size-6" />
        <span
          className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full
            bg-red-500"
        />
      </div>
    </div>
  );
};
