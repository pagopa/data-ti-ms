import * as OP from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { MappingFormatter } from "./types";

export const applySingleInput = <T extends Record<string, unknown>, O>(
  inputFieldName: keyof T,
  outputFieldName?: string
) => (mappingFn: MappingFormatter<T[keyof T], O>) => (
  dataFlow: T
): E.Either<Error, T> =>
  pipe(
    dataFlow[inputFieldName],
    mappingFn,
    E.map(output =>
      pipe(
        outputFieldName,
        OP.fromNullable,
        OP.getOrElseW(() => inputFieldName),
        fieldName => ({ [fieldName]: output })
      )
    ),
    E.map(formatted => ({ ...dataFlow, ...formatted }))
  );
