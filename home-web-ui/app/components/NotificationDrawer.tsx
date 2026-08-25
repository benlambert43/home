import { NotificationContext } from "@/app/components/Notifications";
import { useRouter } from "next/navigation";
import { useContext } from "react";

const toRoute = (referenceLink: string) => {
  try {
    const url = new URL(referenceLink, window.location.origin);
    return url.origin === window.location.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : url.toString();
  } catch {
    return referenceLink;
  }
};

const NotificationDrawer = () => {
  const { notifications, drawer } = useContext(NotificationContext);
  const { open, isClosing, close } = drawer;
  const router = useRouter();

  return (
    open && (
      <dialog
        open={open}
        className={`absolute top-full right-2 left-auto z-50 m-0 mt-2 w-74
          rounded-xl border-0 bg-slate-700 p-4 shadow-lg transition-opacity
          duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      >
        <div
          className="mb-2 text-sm font-semibold tracking-wide text-slate-300
            uppercase"
        >
          Notifications
        </div>
        <div className="flex flex-col gap-2">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400">No new notifications</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                className="rounded-lg bg-slate-600 px-3 py-2 text-left text-sm
                  text-white hover:cursor-pointer hover:bg-slate-500"
                onClick={() => {
                  if (n.referenceLink.length > 0) {
                    router.push(toRoute(n.referenceLink));
                    close();
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
