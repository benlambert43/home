"use client";

import { ReactNode, useEffect, useRef } from "react";

type DialogPlacement = "center" | "start";

type PlacementStyles = {
  dialog: string;
  layout: string;
  panel?: string;
  hiddenDialog: Keyframe;
  hiddenPanel?: Keyframe;
};

const PLACEMENT_STYLES: Record<DialogPlacement, PlacementStyles> = {
  center: {
    dialog: "bg-slate-950/70",
    layout: "flex min-h-full items-center justify-center p-4",
    hiddenDialog: { opacity: 0 },
  },
  start: {
    dialog: "bg-slate-950/70",
    layout: "flex min-h-full justify-start",
    panel: "flex outline-none",
    hiddenDialog: { backgroundColor: "transparent" },
    hiddenPanel: { transform: "translateX(-100%)" },
  },
};

const ENTER: KeyframeAnimationOptions = { duration: 250, easing: "ease-out" };

const EXIT: KeyframeAnimationOptions = {
  duration: 150,
  easing: "ease-in",
  fill: "forwards",
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type TransitionStep = [element: Element | null, hidden: Keyframe | undefined];

const playTransition = (
  direction: "in" | "out",
  steps: TransitionStep[],
): Animation[] => {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return [];

  return steps.flatMap(([element, hidden]) => {
    if (!element || !hidden) return [];
    return direction === "in"
      ? element.animate([{ ...hidden, offset: 0 }], ENTER)
      : element.animate([hidden], EXIT);
  });
};

type DialogProps = {
  open: boolean;
  onClose: () => void;
  label?: string;
  labelledBy?: string;
  dismissible?: boolean;
  placement?: DialogPlacement;
  children?: ReactNode;
};

const Dialog = ({
  open,
  onClose,
  label,
  labelledBy,
  dismissible = true,
  placement = "center",
  children,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { dialog: dialogClasses, layout, panel } = PLACEMENT_STYLES[placement];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const { hiddenDialog, hiddenPanel } = PLACEMENT_STYLES[placement];
    const steps: TransitionStep[] = [
      [dialog, hiddenDialog],
      [panelRef.current, hiddenPanel],
    ];

    if (open) {
      if (dialog.open) return;
      dialog.showModal();
      panelRef.current?.focus({ preventScroll: true });
      const animations = playTransition("in", steps);
      return () => animations.forEach((animation) => animation.cancel());
    }

    if (!dialog.open) return;
    const animations = playTransition("out", steps);
    Promise.all(animations.map((animation) => animation.finished)).then(
      () => dialog.close(),
      () => {},
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [open, placement]);

  const requestClose = () => {
    if (dismissible) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      className={`min-w-site-min fixed inset-0 m-0 h-full max-h-none w-full
        max-w-none overflow-y-auto p-0 text-slate-50 backdrop:bg-transparent
        ${dialogClasses}`}
    >
      <div
        className={layout}
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      >
        {panel ? (
          <div ref={panelRef} tabIndex={-1} className={panel}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </dialog>
  );
};

export default Dialog;
