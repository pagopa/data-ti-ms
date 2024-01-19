import * as J from "fp-ts/lib/Json";
import * as R from "fp-ts/Record";

export const toJsonObject = (jsonData: J.Json): Record<string, unknown> =>
  R.fromEntries(Object.entries(jsonData));
