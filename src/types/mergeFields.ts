import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { has } from "fp-ts/Record";
import * as t from "io-ts";

interface IMergeFieldsMapping<T> {
  readonly input: T;
  readonly newField: string;
  readonly field: ReadonlyArray<keyof T>;
  readonly mapper: "MERGE_FIELDS";
  readonly separator?: string;
}

const isMergeFieldsMappingType = (
  input: unknown
): input is IMergeFieldsMapping<unknown> =>
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

const isMapperMergeFields = (input: IMergeFieldsMapping<unknown>): boolean =>
  input.mapper === "MERGE_FIELDS";

const isInputObject = (input: IMergeFieldsMapping<unknown>): boolean =>
  input.input instanceof Object;

const isNewFieldAString = (input: IMergeFieldsMapping<unknown>): boolean =>
  typeof input.newField === "string";

const isFieldAValidArray = (input: IMergeFieldsMapping<unknown>): boolean =>
  Array.isArray(input.field) && input.field.every(el => has(el, input.input));

const isSeparatorAString = (input: IMergeFieldsMapping<unknown>): boolean =>
  input.separator ? typeof input.separator === "string" : true;

export const MergeFieldsMapping = new t.Type<
  IMergeFieldsMapping<unknown>,
  unknown,
  unknown
>(
  "MergeFieldMapping",
  isMergeFieldsMappingType,
  (input, context) =>
    isMergeFieldsMappingType(input) &&
    isNewFieldAString(input) &&
    isSeparatorAString(input) &&
    isFieldAValidArray(input) &&
    isInputObject(input) &&
    isMapperMergeFields(input)
      ? t.success(input)
      : t.failure(input, context),
  t.identity
);
