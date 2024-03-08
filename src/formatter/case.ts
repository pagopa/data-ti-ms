import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

export const switchCaseFormat = <T>(
  cases: { readonly [key: string]: T },
  defaultValue: T
) => (field: unknown): E.Either<Error, T> =>
  pipe(
    cases[`${field}`],
    O.fromNullable,
    O.getOrElse(() => defaultValue),
    E.right
  );
