"use client";

import ConfirmationModal from "@/app/components/ConfirmationModal";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type UnsavedChangesCheck = () => boolean;

type NavigationGuard = {
  blockWhile: (hasUnsavedChanges: UnsavedChangesCheck) => () => void;
  confirmNavigation: (href: string) => boolean;
};

const NavigationGuardContext = createContext<NavigationGuard>({
  blockWhile: () => () => {},
  confirmNavigation: () => true,
});

export const useNavigationGuard = () => useContext(NavigationGuardContext);

const NavigationGuardProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const router = useRouter();
  const checks = useRef(new Set<UnsavedChangesCheck>());
  const [destination, setDestination] = useState<string>();

  const guard = useMemo<NavigationGuard>(
    () => ({
      blockWhile: (hasUnsavedChanges) => {
        checks.current.add(hasUnsavedChanges);

        return () => {
          checks.current.delete(hasUnsavedChanges);
        };
      },
      confirmNavigation: (href) => {
        const blocked = [...checks.current].some((hasUnsavedChanges) =>
          hasUnsavedChanges(),
        );

        if (!blocked) return true;

        setDestination(href);
        return false;
      },
    }),
    [],
  );

  const leave = () => {
    if (destination === undefined) return;

    setDestination(undefined);
    router.push(destination);
  };

  const stay = () => {
    setDestination(undefined);
  };

  return (
    <NavigationGuardContext value={guard}>
      {children}
      <ConfirmationModal
        open={destination !== undefined}
        title="Leave this page?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        confirmColor="danger"
        onConfirm={leave}
        onCancel={stay}
      >
        Your changes have not been saved and will be lost if you leave.
      </ConfirmationModal>
    </NavigationGuardContext>
  );
};

export default NavigationGuardProvider;
