import { useNavigationGuard } from "@/app/components/NavigationGuardProvider";
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

const NotificationList = ({ onNavigate }: { onNavigate: () => void }) => {
  const { notifications } = useContext(NotificationContext);
  const { confirmNavigation } = useNavigationGuard();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      {notifications.length === 0 ? (
        <p className="text-sm text-slate-300">No new notifications</p>
      ) : (
        notifications.map((n) => (
          <button
            key={n._id}
            type="button"
            className="rounded-lg bg-slate-600 px-3 py-2 text-left text-sm
              text-white hover:cursor-pointer hover:bg-slate-500"
            onClick={() => {
              if (n.referenceLink.length === 0) return;

              const route = toRoute(n.referenceLink);

              if (route.startsWith("/") && !confirmNavigation(route)) return;

              router.push(route);
              onNavigate();
            }}
          >
            {n.message}
          </button>
        ))
      )}
    </div>
  );
};

export default NotificationList;
