import NotificationList from "@/app/components/NotificationList";
import { NotificationContext } from "@/app/components/Notifications";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { useContext } from "react";

const NotificationDrawer = () => {
  const { drawer } = useContext(NotificationContext);
  const { open, isClosing, close } = drawer;

  return (
    open && (
      <dialog
        open={open}
        className={`absolute top-full right-2 left-auto z-50 m-0 mt-2 w-74
          rounded-xl border-0 bg-slate-700 p-4 shadow-lg transition-opacity
          duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div
            className="text-sm font-semibold tracking-wide text-slate-300
              uppercase"
          >
            Notifications
          </div>
          <button
            aria-label="Close notifications"
            className="text-slate-300 hover:cursor-pointer hover:text-slate-100"
            onClick={close}
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>
        <NotificationList onNavigate={close} />
      </dialog>
    )
  );
};

export default NotificationDrawer;
