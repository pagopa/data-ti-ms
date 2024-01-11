import * as t from "io-ts";
export type MappingFormatter<I, O> = (input: I) => O;

export const SingleInputMappingFormatter = <
  T extends Record<string, unknown>,
  K extends keyof T
>(
  inputFieldName: K,
  outputFieldName?: string
): t.Type<Record<string, unknown>> =>
  t.type({
    [inputFieldName]: t.unknown,
    [outputFieldName ?? inputFieldName]: t.unknown
  });
