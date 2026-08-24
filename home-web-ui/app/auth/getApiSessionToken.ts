import "server-only";
import { cookies } from "next/headers";

export const getApiSessionToken = async () =>
  (await cookies()).get("apisession")?.value ?? "";
