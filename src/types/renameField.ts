import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

export const RenameFieldConfig = t.type({
  newFieldName: NonEmptyString
});
export type RenameFieldConfig = t.TypeOf<typeof RenameFieldConfig>;

export const RenameFieldMapping = t.intersection([
  RenameFieldConfig,
  t.type({
    mapper: t.literal("RENAME_FIELD")
  })
]);
export type RenameFieldMapping = t.TypeOf<typeof RenameFieldMapping>;

export const RenameFieldsMapping = t.type({
  mapper: t.literal("RENAME_FIELDS")
});
export type RenameFieldsMapping = t.TypeOf<typeof RenameFieldsMapping>;

export const RenameMapping = t.union([RenameFieldMapping, RenameFieldsMapping]);
export type RenameMapping = t.TypeOf<typeof RenameMapping>;
