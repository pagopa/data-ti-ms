import { ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import * as O from "fp-ts/Option";
import { has } from "fp-ts/Record";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { renameField } from "../formatter/renameField";

type NotInKeys<T, K extends string> = K extends keyof T ? never : K;
export const renameFields = <T, R extends keyof T, K extends string>(
  input: T,
  renameChanges: ReadonlyArray<ITuple2<R, NotInKeys<T, K>>>
): T =>
  renameChanges.reduce(
    (acc, currChange) => renameField(acc, currChange.e1, currChange.e2),
    input
  );

interface IRenameFieldsMapping<T, R extends keyof T, K extends string> {
  readonly input: T;
  readonly renameChanges: ReadonlyArray<ITuple2<R, NotInKeys<T, K>>>;
  readonly mapper: "RENAME_FIELDS";
}

const isRenameFieldsMappingType = (
  input: unknown
): input is IRenameFieldsMapping<unknown, never, string> =>
  pipe(
    input,
    O.fromPredicate(
      stream =>
        stream instanceof Object &&
        has("input", stream) &&
        has("renameChanges", stream) &&
        has("mapper", stream)
    ),
    O.match(
      () => false,
      () => true
    )
  );

const isMapperRenameFields = (
  input: IRenameFieldsMapping<unknown, never, string>
): boolean => input.mapper === "RENAME_FIELDS";

const isInputObject = (
  input: IRenameFieldsMapping<unknown, never, string>
): boolean => input.input instanceof Object;

const isRenameChangesAValidArrayOfTuples2 = (
  input: IRenameFieldsMapping<unknown, never, string>
): boolean =>
  Array.isArray(input.renameChanges) &&
  input.renameChanges.every(
    el => has("e1", el) && has("e2", el) && has(el.e1, input.input)
  );

export const RenameFieldsMapping = new t.Type<
  IRenameFieldsMapping<unknown, never, string>,
  unknown,
  unknown
>(
  "RenameFieldsMapping",
  isRenameFieldsMappingType,
  (input, context) =>
    isRenameFieldsMappingType(input) &&
    isInputObject(input) &&
    isMapperRenameFields(input) &&
    isRenameChangesAValidArrayOfTuples2(input)
      ? t.success(input)
      : t.failure(input, context),
  t.identity
);
