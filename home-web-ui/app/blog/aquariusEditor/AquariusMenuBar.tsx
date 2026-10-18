import { CheckIcon, RadioIcon } from "@/app/blog/aquariusEditor/AquariusIcons";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

export type AquariusMenuItem =
  | {
      type?: "item";
      label: string;
      shortcut?: string;
      disabled?: boolean;
      checked?: boolean;
      radio?: boolean;
      run?: () => void;
    }
  | { type: "separator" };

export type AquariusMenu = { label: string; items: AquariusMenuItem[] };

export const MENU_SEPARATOR: AquariusMenuItem = { type: "separator" };

const ENABLED_ITEMS = "button:not(:disabled)";

const focusItem = (menu: HTMLElement | null, position: "first" | "last") => {
  const items = menu?.querySelectorAll<HTMLButtonElement>(ENABLED_ITEMS);
  if (!items?.length) return;

  items[position === "first" ? 0 : items.length - 1].focus();
};

const moveFocus = (menu: HTMLElement, from: Element, step: 1 | -1) => {
  const items = [...menu.querySelectorAll<HTMLButtonElement>(ENABLED_ITEMS)];
  const index = items.findIndex((item) => item === from);
  const next = items.at((index + step + items.length) % items.length);

  next?.focus();
};

const MenuItemRow = ({
  item,
  onRun,
}: {
  item: Exclude<AquariusMenuItem, { type: "separator" }>;
  onRun: () => void;
}) => (
  <button
    type="button"
    role={
      item.radio
        ? "menuitemradio"
        : item.checked === undefined
          ? "menuitem"
          : "menuitemcheckbox"
    }
    aria-checked={item.checked}
    disabled={item.disabled}
    tabIndex={-1}
    onMouseDown={(event) => {
      event.preventDefault();
    }}
    onClick={() => {
      item.run?.();
      onRun();
    }}
    className={`flex h-4.25 w-full cursor-default items-center gap-4 pr-4 pl-1
      text-left whitespace-nowrap ${
        item.disabled
          ? "text-(--win-shadow) [text-shadow:1px_1px_var(--win-light)]"
          : `hover:bg-(--win-caption) hover:text-(--win-light)
            focus:bg-(--win-caption) focus:text-(--win-light)
            focus:outline-none`
      }`}
  >
    <span className="flex w-3 shrink-0 items-center justify-center">
      {item.checked && (item.radio ? <RadioIcon /> : <CheckIcon />)}
    </span>
    <span className="flex-1">{item.label}</span>
    {item.shortcut && <span className="pl-4">{item.shortcut}</span>}
  </button>
);

const AquariusMenuBar = ({ menus }: { menus: AquariusMenu[] }) => {
  const [open, setOpen] = useState<number>();
  const [tabStop, setTabStop] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open === undefined) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !barRef.current?.contains(event.target)
      ) {
        setOpen(undefined);
      }
    };

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(undefined);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const close = () => {
    setOpen(undefined);
  };

  const openMenu = (index: number, focus?: "first" | "last") => {
    setOpen(index);
    setTabStop(index);

    if (focus) {
      requestAnimationFrame(() => {
        focusItem(menuRef.current, focus);
      });
    }
  };

  const onTitleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const titles =
      barRef.current?.querySelectorAll<HTMLButtonElement>("[data-menu-title]");

    switch (event.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        openMenu(index, "first");
        break;
      case "ArrowUp":
        event.preventDefault();
        openMenu(index, "last");
        break;
      case "ArrowRight":
      case "ArrowLeft": {
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        const next = (index + step + menus.length) % menus.length;
        setTabStop(next);
        titles?.[next].focus();
        if (open !== undefined) openMenu(next, "first");
        break;
      }
      case "Escape":
        close();
        break;
    }
  };

  const onMenuKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    const menu = menuRef.current;
    const target = event.target;
    if (!menu || !(target instanceof Element)) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(menu, target, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(menu, target, -1);
        break;
      case "ArrowRight":
      case "ArrowLeft": {
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        const next = (index + step + menus.length) % menus.length;
        barRef.current
          ?.querySelectorAll<HTMLButtonElement>("[data-menu-title]")
          [next]?.focus();
        openMenu(next, "first");
        break;
      }
      case "Escape":
        event.preventDefault();
        close();
        barRef.current
          ?.querySelectorAll<HTMLButtonElement>("[data-menu-title]")
          [index]?.focus();
        break;
      case "Tab":
        close();
        break;
    }
  };

  return (
    <div
      ref={barRef}
      role="menubar"
      aria-label="Menu"
      className="flex flex-wrap items-center border-b px-0.5"
    >
      {menus.map((menu, index) => (
        <div key={menu.label} className="relative">
          <button
            type="button"
            data-menu-title
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === index}
            tabIndex={tabStop === index ? 0 : -1}
            onMouseDown={(event) => {
              event.preventDefault();
              if (open === index) close();
              else openMenu(index);
            }}
            onMouseEnter={() => {
              if (open !== undefined && open !== index) openMenu(index);
            }}
            onFocus={() => {
              setTabStop(index);
            }}
            onKeyDown={(event) => {
              onTitleKeyDown(event, index);
            }}
            className={`flex h-4.75 cursor-default items-center px-1.5
            focus:outline-none ${
              open === index
                ? "bg-(--win-face) shadow-(--bevel-thin-sunken)"
                : `hover:shadow-(--bevel-thin-raised)
                  focus-visible:shadow-(--bevel-thin-raised)`
            }`}
          >
            {menu.label}
          </button>

          {open === index && (
            <div
              ref={menuRef}
              role="menu"
              aria-label={menu.label}
              onKeyDown={(event) => {
                onMenuKeyDown(event, index);
              }}
              className="absolute top-full left-0 z-30 min-w-44 bg-(--win-face)
                p-0.75 shadow-(--bevel-raised)"
            >
              {menu.items.map((item, itemIndex) =>
                item.type === "separator" ? (
                  <div
                    key={itemIndex}
                    role="separator"
                    className="mx-0.5 my-0.75 h-0.5 border-t border-b
                      border-t-(--win-shadow) border-b-(--win-light)"
                  />
                ) : (
                  <MenuItemRow key={item.label} item={item} onRun={close} />
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AquariusMenuBar;
