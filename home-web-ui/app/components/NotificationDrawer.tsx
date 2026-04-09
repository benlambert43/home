import { NotificationContext } from "@/app/components/Notification";
import { useContext } from "react";

const NotificationDrawer = () => {
  const { content, drawer } = useContext(NotificationContext);
  const { notificationDrawerOpen } = drawer;

  return (
    notificationDrawerOpen && (
      <div
        role="dialog"
        className="fixed top-24 right-4 z-50 w-80 rounded-xl bg-slate-700 p-4
          shadow-lg"
      >
        <div
          className="mb-2 text-sm font-semibold tracking-wide text-slate-300
            uppercase"
        >
          Notifications
        </div>
        <div className="flex flex-col gap-2">
          {content.notifications.length === 0 ? (
            <p className="text-sm text-slate-400">No new notifications</p>
          ) : (
            content.notifications.map((n) => (
              <div
                key={n._id.toString()}
                className="rounded-lg bg-slate-600 px-3 py-2 text-sm text-white"
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      </div>
    )
  );
};

export default NotificationDrawer;
