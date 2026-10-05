import { CHECKBOX_CHECKED_VALUE } from "@home/shared";
import { ReactNode } from "react";

type CheckboxProps = {
  name: string;
  children: ReactNode;
  requirement: "required" | "optional";
  defaultChecked?: boolean;
};

const Checkbox = ({
  name,
  children,
  requirement,
  defaultChecked,
}: CheckboxProps) => (
  <div className="flex items-start gap-3">
    <input
      id={name}
      name={name}
      type="checkbox"
      value={CHECKBOX_CHECKED_VALUE}
      defaultChecked={defaultChecked}
      className="mt-1 size-4 shrink-0 accent-slate-300"
    />
    <label htmlFor={name}>
      {children} <span className="text-slate-400">({requirement})</span>
    </label>
  </div>
);

export default Checkbox;
