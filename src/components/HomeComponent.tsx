import { PageContent } from "./homeComponents/PageContent";

export const HomeComponent = () => {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        justifyContent: "center",
      }}
    >
      <PageContent />
    </div>
  );
};
