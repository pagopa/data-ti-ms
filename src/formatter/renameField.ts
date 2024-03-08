import { ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

export const renameField = <
  T extends Record<string, unknown>,
  R extends keyof T,
  K extends string
>(
  inputFieldName: R,
  newFieldName: K
) => (input: T): E.Either<Error, T> =>
  pipe(
    {
      ...input,
      [inputFieldName]: undefined,
      [newFieldName]: input[inputFieldName]
    },
    res => withoutUndefinedValues(res),
    E.right
  );

export const renameFields = <
  T extends Record<string, unknown>,
  R extends string,
  K extends string
>(
  renameChanges: ReadonlyArray<ITuple2<R, K>>
) => (input: T): E.Either<Error, Record<string, unknown>> =>
  pipe(
    renameChanges.reduce(
      (acc, currChange) =>
        pipe(
          acc,
          E.chain(accumulator =>
            renameField(currChange.e1, currChange.e2)(accumulator)
          )
        ),
      E.right(input)
    )
  );
