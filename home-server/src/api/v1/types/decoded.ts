export type Decoded<Value> =
  { ok: true; value: Value } | { ok: false; message: string };
