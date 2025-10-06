const Content = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="flex justify-around items-center">{children}</div>;
};

export default Content;
