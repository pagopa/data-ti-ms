import { pipe } from "fp-ts/lib/function";
import * as OP from "fp-ts/lib/Option";
import { MappingFormatter } from "./types";

export const applyFormat = <T, O>(
  dataFlow: T,
  inputFieldName: keyof T,
  outputFieldName?: string
) => (mappingFn: MappingFormatter<T[keyof T], O>): T =>
  pipe(
    dataFlow[inputFieldName],
    mappingFn,
    output =>
      pipe(
        outputFieldName,
        OP.fromNullable,
        OP.getOrElseW(() => inputFieldName),
        fieldName => ({ [fieldName]: output })
      ),
    formatted => ({ ...dataFlow, ...formatted })
  );
