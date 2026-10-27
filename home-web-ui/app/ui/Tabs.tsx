import { KeyboardEvent, ReactNode, useId } from "react";

export type TabOption<T extends string> = { value: T; label: string };

const TAB_CLASSES =
  "-mb-px border-b-2 px-1 pb-2 text-xs font-medium tracking-wide uppercase hover:cursor-pointer focus-visible:outline-slate-100";

const SELECTED_TAB_CLASSES = "border-slate-100 text-slate-100";

const UNSELECTED_TAB_CLASSES =
  "border-transparent text-slate-400 hover:text-slate-200";

const Tabs = <T extends string>({
  label,
  tabs,
  value,
  onChange,
  children,
}: {
  label: string;
  tabs: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
}) => {
  const id = useId();
  const tabId = (tab: T) => `${id}-tab-${tab}`;
  const panelId = (tab: T) => `${id}-panel-${tab}`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.value === value);
    const moves = new Map([
      ["ArrowRight", index + 1],
      ["ArrowLeft", index - 1],
      ["Home", 0],
      ["End", tabs.length - 1],
    ]);
    const next = moves.get(event.key);
    if (next === undefined) return;

    event.preventDefault();
    const tab = tabs[(next + tabs.length) % tabs.length];
    onChange(tab.value);
    document.getElementById(tabId(tab.value))?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-4 border-b border-slate-800"
      >
        {tabs.map((tab) => {
          const selected = tab.value === value;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={tabId(tab.value)}
              aria-selected={selected}
              aria-controls={panelId(tab.value)}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                onChange(tab.value);
              }}
              className={`${TAB_CLASSES} ${
                selected ? SELECTED_TAB_CLASSES : UNSELECTED_TAB_CLASSES
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId(value)} aria-labelledby={tabId(value)}>
        {children}
      </div>
    </div>
  );
};

export default Tabs;
