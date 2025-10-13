const RightContent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="flex">{children}</div>;
};

export default RightContent;
