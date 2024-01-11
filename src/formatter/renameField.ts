import * as E from "fp-ts/Either";
import { modifyAt } from "fp-ts/Record";
import { pipe } from "fp-ts/function";

export const renameField = <T extends Record<string, unknown>>(
  input: T,
  field: keyof T,
  newField: unknown
): E.Either<Error, T> =>
  pipe(
    input,
    modifyAt(String(field), () => newField),
    E.fromOption(() => new Error(`Field ${String(field)} not found`)),
    E.map(r => r as T)
  );
