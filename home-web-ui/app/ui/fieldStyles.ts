export type FieldWidth = "wide" | "paired";

export const FIELD_WIDTHS: Record<
  FieldWidth,
  { wrapper: string; field: string }
> = {
  wide: {
    wrapper: "flex flex-col items-start justify-center gap-2",
    field: "w-full max-w-160",
  },
  paired: {
    wrapper: "flex w-full max-w-78 flex-col items-start justify-center gap-2",
    field: "w-full max-w-78",
  },
};

export const FIELD_CLASSES =
  "rounded-xl px-4 py-2 outline-1 outline-slate-400 focus:outline-slate-50";
