const NotificationDrawer = (props: { notificationDrawerOpen: boolean }) => {
  const { notificationDrawerOpen } = props;
  return (
    <>
      <dialog open={notificationDrawerOpen}>
        <div className="">Notifications will go here</div>
      </dialog>
    </>
  );
};

export default NotificationDrawer;
