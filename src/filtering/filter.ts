import { DataFilter } from "@pagopa/data-indexer-commons";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

const withField = (value: unknown): E.Either<Error, unknown> =>
  pipe(
    value,
    O.fromNullable,
    E.fromOption(() => new Error("Field is not defined"))
  );

const filterHandlerMap: Record<
  string,
  (input: unknown, compare?: never | unknown) => E.Either<Error, boolean>
> = {
  eq: (input, compare) => E.right(input === compare),
  gt: (input, compare) => E.right(input > compare),
  gte: (input, compare) => E.right(input >= compare),
  isNotNull: input => E.right(input !== null),
  isNotUndefined: input => E.right(input !== undefined),
  isNull: input => E.right(input === null),
  isUndefined: input => E.right(input === undefined),
  lt: (input, compare) => E.right(input < compare),
  lte: (input, compare) => E.right(input <= compare),
  neq: (input, compare) => E.right(input !== compare)
};

export const filterStatic = <
  T extends Record<string, unknown>,
  R extends keyof T,
  K
>(
  fieldName: R,
  condition: keyof typeof filterHandlerMap,
  staticValue?: K
) => (input: T): E.Either<Error, boolean> =>
  pipe(
    { condition, fieldName, staticValue },
    DataFilter.decode,
    E.mapLeft(() => new Error("Wrong Filter Definition")),
    E.chain(_ =>
      pipe(
        input[fieldName],
        withField,
        E.chain(value => filterHandlerMap[condition](value, staticValue))
      )
    )
  );

export const filterDynamic = <
  T extends Record<string, unknown>,
  R extends keyof T,
  K extends keyof T
>(
  fieldName: R,
  condition: keyof typeof filterHandlerMap,
  compareField: K
) => (input: T): E.Either<Error, boolean> =>
  pipe(
    {
      compareField,
      condition,
      fieldName
    },
    DataFilter.decode,
    E.mapLeft(errors => new Error(errors.map(e => e.message).join("\n"))),
    E.chain(_ =>
      pipe(
        input[fieldName],
        withField,
        E.chain(value =>
          pipe(
            input[compareField],
            withField,
            E.chain(compare => filterHandlerMap[condition](value, compare))
          )
        )
      )
    )
  );
