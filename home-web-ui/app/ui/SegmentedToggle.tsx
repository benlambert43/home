import { CheckIcon } from "@heroicons/react/16/solid";

type SegmentedToggleOption<T extends string> = { value: T; label: string };

const GROUP_CLASSES =
  "gap-0.5 rounded-md p-0.5 inset-ring-1 inset-ring-slate-400";

const FILL_GRID_CLASSES =
  "grid w-full grid-cols-[repeat(auto-fill,minmax(min(11rem,100%),1fr))] gap-0.5";

const SegmentedToggle = <T extends string>({
  label,
  options,
  value,
  onChange,
  fill = false,
}: {
  label: string;
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  fill?: boolean;
}) => {
  const buttons = options.map((option) => {
    const selected = option.value === value;

    return (
      <button
        key={option.value}
        type="button"
        aria-pressed={selected}
        onClick={() => {
          onChange(option.value);
        }}
        className={`flex items-center justify-center rounded-sm px-8 py-1
          text-base whitespace-nowrap transition-colors hover:cursor-pointer
          focus-visible:outline-slate-100 pointer-coarse:py-2 ${
            selected
              ? "bg-slate-200 font-medium text-slate-900"
              : `bg-slate-800 text-slate-200 hover:bg-slate-700
                hover:text-slate-100 active:bg-slate-600`
          }`}
      >
        <span className="relative">
          {selected ? (
            <CheckIcon
              aria-hidden
              className="absolute top-1/2 right-full mr-1 size-4
                -translate-y-1/2"
            />
          ) : null}
          {option.label}
        </span>
      </button>
    );
  });

  if (fill && options.length === 2) {
    return (
      <div className={`@container p-0.5 ${FILL_GRID_CLASSES}`}>
        <div
          role="group"
          aria-label={label}
          className={`col-span-2 -m-0.5 grid grid-cols-2
            @max-[22.125rem]:col-span-1 @max-[22.125rem]:grid-cols-1
            ${GROUP_CLASSES}`}
        >
          {buttons}
        </div>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={`${GROUP_CLASSES} ${
        fill ? FILL_GRID_CLASSES : "inline-flex flex-wrap self-start"
      }`}
    >
      {buttons}
    </div>
  );
};

export default SegmentedToggle;
