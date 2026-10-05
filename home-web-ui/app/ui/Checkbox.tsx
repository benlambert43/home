import { CHECKBOX_CHECKED_VALUE } from "@home/shared";
import { InputHTMLAttributes, ReactNode, Ref } from "react";

type CheckboxProps = {
  name: string;
  children: ReactNode;
  requirement: "required" | "optional";
  ref?: Ref<HTMLInputElement>;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "onChange"
>;

const Checkbox = ({ name, children, requirement, ...input }: CheckboxProps) => (
  <div className="flex items-start gap-3">
    <input
      id={name}
      name={name}
      type="checkbox"
      value={CHECKBOX_CHECKED_VALUE}
      className="mt-1 size-4 shrink-0 accent-slate-300"
      {...input}
    />
    <label htmlFor={name}>
      {children} <span className="text-slate-400">({requirement})</span>
    </label>
  </div>
);

export default Checkbox;
