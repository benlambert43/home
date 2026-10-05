import { getBffSessionUser } from "@/app/auth/getBffSessionUser";

export type SessionStatus = { signedIn: boolean; isAdmin: boolean };

export const GET = async () => {
  const user = await getBffSessionUser();

  return Response.json(
    {
      signedIn: user !== null,
      isAdmin: user?.role === "admin",
    } satisfies SessionStatus,
    { headers: { "Cache-Control": "private, no-store" } },
  );
};
