"use client";

import { POST_FORM_FIELDS } from "@/app/blog/postForm/postFormFields";
import { readFormValues } from "@/app/lib/forms";
import { KeyboardEvent, ReactNode, RefObject, useId, useState } from "react";

export type PostFormSnapshot = Record<keyof typeof POST_FORM_FIELDS, string> & {
  at: string;
};

export type PostFormView = "editor" | "preview";

const VIEWS: { value: PostFormView; label: string }[] = [
  { value: "editor", label: "Text Editor" },
  { value: "preview", label: "Blog Post Preview" },
];

const TAB_CLASSES =
  "rounded-md px-4 py-1 text-base transition-colors duration-200 ease-out hover:cursor-pointer focus:outline-slate-100";

const SELECTED_TAB_CLASSES = "bg-slate-500 text-slate-50";

const UNSELECTED_TAB_CLASSES =
  "text-slate-300 hover:bg-slate-700 hover:text-slate-50";

const PostFormViews = ({
  view,
  onViewChange,
  formRef,
  renderPreview,
  actions,
  children,
}: {
  view: PostFormView;
  onViewChange: (view: PostFormView) => void;
  formRef: RefObject<HTMLFormElement | null>;
  renderPreview: (snapshot: PostFormSnapshot) => ReactNode;
  actions: ReactNode;
  children: ReactNode;
}) => {
  const [snapshot, setSnapshot] = useState<PostFormSnapshot>();
  const id = useId();

  const tabId = (value: PostFormView) => `${id}-${value}-tab`;

  const panelId = (value: PostFormView) => `${id}-${value}-panel`;

  const show = (next: PostFormView) => {
    if (next === "preview") {
      const form = formRef.current;
      if (!form) return;

      setSnapshot({
        ...readFormValues(new FormData(form), POST_FORM_FIELDS),
        at: new Date().toISOString(),
      });
    }

    onViewChange(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;

    event.preventDefault();

    const index = VIEWS.findIndex((candidate) => candidate.value === view);
    const next = VIEWS[(index + step + VIEWS.length) % VIEWS.length].value;

    show(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Post view"
        className="flex w-fit flex-row gap-1 rounded-lg p-1 inset-ring-1
          inset-ring-slate-400"
      >
        {VIEWS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={tabId(value)}
            aria-selected={view === value}
            aria-controls={panelId(value)}
            tabIndex={view === value ? 0 : -1}
            onClick={() => {
              show(value);
            }}
            onKeyDown={onKeyDown}
            className={`${TAB_CLASSES} ${
              view === value ? SELECTED_TAB_CLASSES : UNSELECTED_TAB_CLASSES
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={panelId("editor")}
        aria-labelledby={tabId("editor")}
        hidden={view !== "editor"}
        className="flex flex-col gap-4"
      >
        {children}
      </div>

      <div
        role="tabpanel"
        id={panelId("preview")}
        aria-labelledby={tabId("preview")}
        hidden={view !== "preview"}
      >
        {view === "preview" && snapshot && renderPreview(snapshot)}
      </div>

      {actions}
    </>
  );
};

export default PostFormViews;
