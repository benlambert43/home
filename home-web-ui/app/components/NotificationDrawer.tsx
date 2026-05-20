import { NotificationContext } from "@/app/components/Notification";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

const NotificationDrawer = () => {
  const { content, drawer } = useContext(NotificationContext);
  const { notificationDrawerOpen } = drawer;
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  return (
    notificationDrawerOpen && (
      <dialog
        open={notificationDrawerOpen}
        className={`absolute top-full right-2 left-auto z-50 m-0 mt-2 w-80
          rounded-xl border-0 bg-slate-700 p-4 shadow-lg transition-opacity
          duration-250 ${isClosing ? "opacity-0" : "opacity-100"}`}
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
              <button
                key={n._id.toString()}
                className="rounded-lg bg-slate-600 px-3 py-2 text-left text-sm
                  text-white hover:cursor-pointer hover:bg-slate-500"
                onClick={() => {
                  if (n.referenceLink && n.referenceLink.length > 0) {
                    setIsClosing(true);
                    router.push(n.referenceLink);
                    setTimeout(() => {
                      drawer.handleSetNotificationDrawerClosed();
                      setIsClosing(false);
                    }, 250);
                  }
                }}
              >
                {n.message}
              </button>
            ))
          )}
        </div>
      </dialog>
    )
  );
};

export default NotificationDrawer;
