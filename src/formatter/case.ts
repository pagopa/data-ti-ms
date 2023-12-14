import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

export const switchCaseFormat = <T>(
  cases: { readonly [key: string]: T },
  defaultValue: T
) => (field: unknown): T =>
  pipe(
    cases[`${field}`],
    O.fromNullable,
    O.getOrElse(() => defaultValue)
  );
