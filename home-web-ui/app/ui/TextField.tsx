import { InputHTMLAttributes } from "react";

type TextFieldWidth = "wide" | "paired";

const WIDTHS: Record<TextFieldWidth, { wrapper: string; input: string }> = {
  wide: {
    wrapper: "flex flex-col items-start justify-center gap-2",
    input: "w-full max-w-160",
  },
  paired: {
    wrapper: "flex w-full max-w-78 flex-col items-start justify-center gap-2",
    input: "w-full max-w-78",
  },
};

const INPUT_CLASSES =
  "rounded-xl px-4 py-2 outline-1 outline-slate-400 focus:outline-slate-50";

type TextFieldProps = {
  name: string;
  label: string;
  width?: TextFieldWidth;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "id" | "className" | "children"
>;

const TextField = ({
  name,
  label,
  width = "wide",
  ...input
}: TextFieldProps) => (
  <div className={WIDTHS[width].wrapper}>
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      className={`${WIDTHS[width].input} ${INPUT_CLASSES}`}
      {...input}
    />
  </div>
);

export default TextField;
