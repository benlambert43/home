import { FIELD_CLASSES, FIELD_WIDTHS, FieldWidth } from "@/app/ui/fieldStyles";
import { InputHTMLAttributes, useId } from "react";

type TextFieldProps = {
  name: string;
  label: string;
  width?: FieldWidth;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "id" | "className" | "children"
>;

const TextField = ({
  name,
  label,
  width = "wide",
  ...input
}: TextFieldProps) => {
  const id = useId();

  return (
    <div className={FIELD_WIDTHS[width].wrapper}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        className={`${FIELD_WIDTHS[width].field} ${FIELD_CLASSES}`}
        {...input}
      />
    </div>
  );
};

export default TextField;
