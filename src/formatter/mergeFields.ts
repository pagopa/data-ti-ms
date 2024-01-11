import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { has } from "fp-ts/Record";
import { pipe } from "fp-ts/function";
export const mergeFields = <T extends Record<string, unknown>>(
  input: T,
  fields: ReadonlyArray<keyof T>,
  newField: string,
  separator: string = ","
): E.Either<Error, T> =>
  pipe(
    A.traverse(E.Applicative)((field: keyof T) =>
      has(String(field), input)
        ? E.right(String(input[field]))
        : E.left(new Error("Not all fields are present"))
    )(Array.from(fields)),
    E.map(fieldValues => ({
      ...input,
      [newField]: fieldValues.join(separator)
    }))
  );
