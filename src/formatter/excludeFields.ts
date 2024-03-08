import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

export const excludeFields = <T extends Record<string, unknown>>(
  fields: ReadonlyArray<keyof T>
) => (input: T): E.Either<Error, Partial<T>> =>
  pipe(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]: undefined
      }),
      {}
    ),
    toExcludeFields => ({ ...input, ...toExcludeFields }),
    withoutUndefinedValues,
    E.right
  );
