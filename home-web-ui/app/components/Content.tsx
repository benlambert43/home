const Content = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="flex items-start justify-around">{children}</div>;
};

export default Content;
