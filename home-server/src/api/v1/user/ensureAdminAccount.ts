import { createNewUniqueRandomUsername } from "../accountManagement/handlers/handleCreateAccount";
import { hashPassword } from "../auth/password";
import { UserModel } from "../model/userModel";

interface AdminAccount {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export const ensureAdminAccount = async ({
  password,
  ...account
}: AdminAccount) => {
  const existing = await UserModel.findOne({ email: account.email });

  if (existing?.role === "admin") return;

  if (existing) {
    throw new Error(
      "An account that is not an admin already uses ADMIN_EMAIL. It may belong to someone else, so it was not made an admin. Delete that account or change ADMIN_EMAIL.",
    );
  }

  const username = await createNewUniqueRandomUsername();
  if (!username) {
    throw new Error("Could not find a unique username for the admin account.");
  }

  const now = new Date();

  await new UserModel({
    ...account,
    username,
    confirmedEmail: false,
    userBanned: false,
    password: await hashPassword(password),
    createdDate: now,
    modifiedDate: now,
    role: "admin",
    termsConsent: { agreed: true, timestamp: now },
    newsletterConsent: { agreed: false, timestamp: now },
    marketingConsent: { agreed: false, timestamp: now },
  }).save();

  console.log("Created the admin account for ADMIN_EMAIL.");
};
