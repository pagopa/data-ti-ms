import * as R from "fp-ts/Record";

export const toJsonObject = (jsonData: unknown): Record<string, unknown> =>
  R.fromEntries(Object.entries(jsonData));
