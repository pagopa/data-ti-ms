import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";

export const switchCaseFormat = <T>(
  cases: { readonly [key: string]: T },
  defaultValue: T
) => (field: unknown): T =>
  pipe(
    cases[`${field}`],
    O.fromNullable,
    O.getOrElse(() => defaultValue)
  );
