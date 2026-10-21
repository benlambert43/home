type SegmentedToggleOption<T extends string> = { value: T; label: string };

const SegmentedToggle = <T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div
    role="group"
    aria-label={label}
    className="inline-flex self-start rounded-md p-0.5 inset-ring-1
      inset-ring-slate-400"
  >
    {options.map((option) => {
      const selected = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={selected}
          onClick={() => {
            onChange(option.value);
          }}
          className={`rounded-sm px-4 py-0.5 text-base hover:cursor-pointer
          focus:outline-slate-100 ${
            selected
              ? "bg-slate-500 text-slate-50"
              : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedToggle;
