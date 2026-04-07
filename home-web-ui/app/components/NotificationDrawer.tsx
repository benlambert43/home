import { NotificationContext } from "@/app/components/Notification";
import { useContext } from "react";

const NotificationDrawer = () => {
  const { content, drawer, stream } = useContext(NotificationContext);
  const { notificationDrawerOpen } = drawer;

  return (
    <>
      <dialog open={notificationDrawerOpen}>
        <div className="">Notifications will go here</div>
        <div>
          {content.notifications.map((n) => (
            <div key={n._id.toString()}>{n.message}</div>
          ))}
        </div>
      </dialog>
    </>
  );
};

export default NotificationDrawer;
