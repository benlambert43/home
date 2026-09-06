import { FIELD_CLASSES, FIELD_WIDTHS, FieldWidth } from "@/app/ui/fieldStyles";
import { TextareaHTMLAttributes } from "react";

type TextAreaProps = {
  name: string;
  label: string;
  width?: FieldWidth;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name" | "id" | "className" | "children"
>;

const TextArea = ({
  name,
  label,
  width = "wide",
  ...textarea
}: TextAreaProps) => (
  <div className={FIELD_WIDTHS[width].wrapper}>
    <label htmlFor={name}>{label}</label>
    <textarea
      id={name}
      name={name}
      className={`${FIELD_WIDTHS[width].field} ${FIELD_CLASSES}`}
      {...textarea}
    />
  </div>
);

export default TextArea;
