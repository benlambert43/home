import { getBffSessionUser } from "@/app/auth/getBffSessionUser";

export type SessionStatus = { signedIn: boolean };

export const GET = async () =>
  Response.json(
    { signedIn: (await getBffSessionUser()) !== null } satisfies SessionStatus,
    { headers: { "Cache-Control": "private, no-store" } },
  );
