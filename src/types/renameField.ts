import * as O from "fp-ts/Option";
import { has } from "fp-ts/Record";
import * as t from "io-ts";

import { pipe } from "fp-ts/function";

type NotInKeys<T, K extends string> = K extends keyof T ? never : K;

interface IRenameFieldMapping<T, R extends keyof T, K extends string> {
  readonly input: T;
  readonly newField: NotInKeys<T, K>;
  readonly field: R;
  readonly mapper: "RENAME_FIELD";
}
const isRenameFieldMappingType = (
  input: unknown
): input is IRenameFieldMapping<unknown, never, string> =>
  pipe(
    input,
    O.fromPredicate(
      stream =>
        stream instanceof Object &&
        has("field", stream) &&
        has("input", stream) &&
        has("newField", stream) &&
        has("mapper", stream)
    ),
    O.match(
      () => false,
      () => true
    )
  );

const isMapperRenameField = (
  input: IRenameFieldMapping<unknown, never, string>
): boolean => input.mapper === "RENAME_FIELD";

const isNewFieldUnique = (
  input: IRenameFieldMapping<unknown, never, string>
): boolean => !Object.keys(input.input).includes(input.newField);

const isFieldInInputObject = (
  input: IRenameFieldMapping<unknown, never, string>
): boolean => Object.keys(input.input).includes(input.field);

export const RenameFieldMapping = new t.Type<
  IRenameFieldMapping<unknown, never, string>,
  unknown,
  unknown
>(
  "RenameFieldMapping",
  isRenameFieldMappingType,
  (input, context) =>
    isRenameFieldMappingType(input) &&
    isMapperRenameField(input) &&
    isFieldInInputObject(input) &&
    isNewFieldUnique(input)
      ? t.success(input)
      : t.failure(input, context),
  t.identity
);
