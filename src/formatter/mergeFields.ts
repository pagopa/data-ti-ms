import { pipe } from "fp-ts/function";
export const mergeFields = <T>(
  input: T,
  fields: ReadonlyArray<keyof T>,
  newField: string,
  separator: string = ","
): T =>
  pipe(
    fields.map(field => input[field]),
    fieldValues => ({
      ...input,
      [newField]: fieldValues.join(separator)
    })
  );
