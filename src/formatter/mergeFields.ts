import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
export const mergeFields = <T extends Record<string, unknown>>(
  fields: ReadonlyArray<keyof T>,
  newField: string,
  separator: string = ","
) => (input: T): E.Either<Error, T> =>
  pipe(
    fields.map(field => input[field]),
    fieldValues => ({
      ...input,
      [newField]: fieldValues.join(separator)
    }),
    E.right
  );
