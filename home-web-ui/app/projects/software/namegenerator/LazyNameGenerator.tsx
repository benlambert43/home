"use client";

import { hasGeneratorParams } from "@/app/projects/software/namegenerator/params";
import { CARD_CLASSES } from "@/app/projects/software/namegenerator/styles";
import Button from "@/app/ui/Button";
import { useSearchParams } from "next/navigation";
import { lazy, ReactNode, Suspense, use, useState } from "react";
import { browser } from "react-dom";

const NameGenerator = lazy(
  () => import("@/app/projects/software/namegenerator/NameGenerator"),
);

const Preview = ({
  loading = false,
  onOpen,
  children,
}: {
  loading?: boolean;
  onOpen?: () => void;
  children: ReactNode;
}) => (
  <>
    <div>
      <Button type="button" size="large" disabled={loading} onClick={onOpen}>
        {loading ? "Loading…" : "Open the Generator"}
      </Button>
    </div>
    <section aria-label="Name generator preview" className={CARD_CLASSES}>
      {children}
    </section>
  </>
);

const Loader = ({ children }: { children: ReactNode }) => {
  use(browser("The generator opens from the browser's URL query string."));
  const searchParams = useSearchParams();
  const [opened, setOpened] = useState(false);

  if (!opened && !hasGeneratorParams(searchParams.keys())) {
    return (
      <Preview
        onOpen={() => {
          setOpened(true);
        }}
      >
        {children}
      </Preview>
    );
  }

  return (
    <Suspense fallback={<Preview loading>{children}</Preview>}>
      <NameGenerator params={Object.fromEntries(searchParams)} />
    </Suspense>
  );
};

const LazyNameGenerator = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<Preview>{children}</Preview>}>
    <Loader>{children}</Loader>
  </Suspense>
);

export default LazyNameGenerator;
