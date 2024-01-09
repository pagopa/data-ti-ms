import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { modifyAt } from "fp-ts/Record";
import { identity, pipe } from "fp-ts/function";

const jsonParse: <T>(
  text: string
) => E.Either<Error, Record<string, T>> = E.tryCatchK(JSON.parse, E.toError);

export const renameField = <T>(
  input: string,
  field: keyof Record<string, T>,
  newField: T
): string =>
  pipe(
    jsonParse<T>(input),
    E.bimap(
      err => `Cannot parse JSON: ${err.message}`,
      parsedJson =>
        pipe(
          parsedJson,
          modifyAt(field, () => newField),
          O.getOrElseW(() => `Cannot find field: ${field}`),
          JSON.stringify
        )
    ),
    E.getOrElse(identity)
  );
