import { DropdownArrowIcon } from "@/app/blog/aquariusEditor/AquariusIcons";
import { KeyboardEvent, ReactNode, useState } from "react";

export type ToolbarItem =
  | {
      type?: "button";
      title: string;
      icon: ReactNode;
      run: () => void;
      active?: boolean;
      disabled?: boolean;
    }
  | {
      type: "combo";
      title: string;
      value: string;
      options: { value: string; label: string }[];
      width: string;
      disabled?: boolean;
      onChange: (value: string) => void;
    }
  | { type: "separator" };

export const TOOLBAR_SEPARATOR: ToolbarItem = { type: "separator" };

const FOCUSABLE = "button:not(:disabled), select:not(:disabled)";

const AquariusToolbar = ({
  label,
  items,
}: {
  label: string;
  items: ToolbarItem[];
}) => {
  const [tabStop, setTabStop] = useState(0);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      (event.key !== "ArrowRight" && event.key !== "ArrowLeft") ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const controls = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE),
    ];
    const index = controls.findIndex((control) => control === event.target);
    if (index === -1) return;

    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    controls.at((index + step + controls.length) % controls.length)?.focus();
  };

  return (
    <div
      role="toolbar"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex flex-wrap items-center gap-px px-0.5 py-px"
    >
      {items.map((item, index) => {
        if (item.type === "separator") {
          return (
            <span
              key={index}
              role="separator"
              className="mx-1 h-4.5 w-0.5 self-center border-r border-l
                border-r-(--win-light) border-l-(--win-shadow)"
            />
          );
        }

        const tabIndex = tabStop === index ? 0 : -1;

        if (item.type === "combo") {
          return (
            <span
              key={item.title}
              className="relative mx-px inline-flex h-5.5 items-center"
            >
              <select
                value={item.value}
                title={item.title}
                aria-label={item.title}
                disabled={item.disabled}
                tabIndex={tabIndex}
                onFocus={() => {
                  setTabStop(index);
                }}
                onChange={(event) => {
                  item.onChange(event.target.value);
                }}
                className={`h-5.25 shadow-(--bevel-sunken) ${item.width}
                cursor-default appearance-none rounded-none bg-(--win-light)
                pr-5 pl-1 font-(family-name:--font-win) text-[11px] text-black
                outline-none focus-visible:bg-(--win-caption)
                focus-visible:text-(--win-light) disabled:text-(--win-shadow)`}
              >
                {item.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0.5 right-0.5 flex
                  h-4.25 w-4 items-center justify-center bg-(--win-face)
                  shadow-(--bevel-raised)"
              >
                <DropdownArrowIcon />
              </span>
            </span>
          );
        }

        return (
          <button
            key={item.title}
            type="button"
            title={item.title}
            aria-label={item.title}
            aria-pressed={item.active}
            disabled={item.disabled}
            tabIndex={tabIndex}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onFocus={() => {
              setTabStop(index);
            }}
            onClick={item.run}
            className={`flex size-5.5 cursor-default items-center justify-center
            focus:outline-none disabled:opacity-40 disabled:grayscale ${
              item.active
                ? "bg-[#e8e5e0] shadow-(--bevel-thin-sunken)"
                : `focus-visible:shadow-(--bevel-thin-raised)
                  enabled:hover:shadow-(--bevel-thin-raised)`
            }`}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
};

export default AquariusToolbar;
