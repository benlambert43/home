import * as z from "zod";

export type FieldNames<Schema extends z.ZodType> = Record<
  keyof z.input<Schema>,
  string
>;

export type SubmittedFormErrors = {
  errors: string[];
  properties?: Record<string, { errors: string[] } | undefined>;
};

export const readFormValues = <Field extends string>(
  formData: FormData,
  fieldNames: Readonly<Record<Field, string>>,
): Partial<Record<Field, string>> =>
  Object.fromEntries(
    Object.entries<string>(fieldNames).map(([field, inputName]) => {
      const value = formData.get(inputName);
      return [field, typeof value === "string" ? value : undefined];
    }),
  ) as Partial<Record<Field, string>>;

export const treeifyFormError = <T>(error: z.ZodError<T>) =>
  z.treeifyError(error, (issue) => `⚠️ ${issue.message}`);

export const hasFormErrors = (state: SubmittedFormErrors | undefined) =>
  Boolean(
    state &&
    (state.errors.length > 0 ||
      Object.values(state.properties ?? {}).some((field) =>
        Boolean(field?.errors.length),
      )),
  );
