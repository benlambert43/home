const Content = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="flex items-center justify-around">{children}</div>;
};

export default Content;
