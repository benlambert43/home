export type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export const paramFilled = (
  value: string | string[] | undefined,
): value is string => typeof value === "string" && value.length > 0;
