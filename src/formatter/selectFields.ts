import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/function";

export const selectFields = <T>(
  input: T,
  fields: ReadonlyArray<keyof T>
): Partial<T> =>
  pipe(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]: input[field]
      }),
      {}
    ),
    withoutUndefinedValues
  );
