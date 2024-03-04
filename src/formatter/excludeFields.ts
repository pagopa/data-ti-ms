import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/function";

export const excludeFields = <T>(
  input: T,
  fields: ReadonlyArray<keyof T>
): Partial<T> =>
  pipe(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]: undefined
      }),
      {}
    ),
    toExcludeFields => ({ ...input, ...toExcludeFields }),
    withoutUndefinedValues
  );
