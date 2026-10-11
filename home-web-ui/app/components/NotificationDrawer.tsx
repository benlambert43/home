import NotificationList from "@/app/components/NotificationList";
import { NotificationContext } from "@/app/components/Notifications";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { useContext, useId } from "react";

type NotificationDrawerProps = {
  id: string;
  onClose: () => void;
};

const NotificationDrawer = ({ id, onClose }: NotificationDrawerProps) => {
  const { drawer } = useContext(NotificationContext);
  const { open, isClosing } = drawer;
  const titleId = useId();

  return (
    open && (
      <dialog
        id={id}
        open={open}
        aria-labelledby={titleId}
        className={`absolute top-full right-2 left-auto z-50 m-0 mt-2 w-74
          rounded-xl border-0 bg-slate-700 p-4 shadow-lg transition-opacity
          duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div
            id={titleId}
            className="text-sm font-semibold tracking-wide text-slate-300
              uppercase"
          >
            Notifications
          </div>
          <button
            type="button"
            aria-label="Close notifications"
            className="text-slate-300 hover:cursor-pointer hover:text-slate-100"
            onClick={onClose}
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>
        <NotificationList onNavigate={onClose} />
      </dialog>
    )
  );
};

export default NotificationDrawer;
