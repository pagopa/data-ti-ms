import * as t from "io-ts";

export const SelectFieldsMapping = t.type({
  mapper: t.literal("SELECT_FIELDS")
});

export type SelectFieldsMapping = t.TypeOf<typeof SelectFieldsMapping>;
