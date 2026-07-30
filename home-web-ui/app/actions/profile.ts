import * as z from "zod";
import {
  ChangeUsernameFormSchema,
  ChangeUsernameFormState,
} from "@/app/lib/definitions";

export const changeUsername = async (
  state: ChangeUsernameFormState,
  formData: FormData,
) => {
  const unvalidatedInputs = {
    unvalidatedNewUsername: formData.get("newUsername")
      ? formData.get("newUsername")?.toString()
      : undefined,
  };

  const changeUsernameReturn: ChangeUsernameFormState = {
    errors: [],
    values: { newUsername: unvalidatedInputs.unvalidatedNewUsername },
    properties: {},
  };

  const validatedFields = ChangeUsernameFormSchema.safeParse({
    newUsername: formData.get("newUsername"),
  });

  if (!validatedFields.success) {
    const errors = z.treeifyError(validatedFields.error);
    return { ...changeUsernameReturn, ...errors };
  }
};
