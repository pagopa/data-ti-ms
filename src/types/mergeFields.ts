import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

export const MergeFieldsMapping = t.type({
  mapper: t.literal("MERGE_FIELDS"),
  newFieldName: NonEmptyString
});

export type MergeFieldMapping = t.TypeOf<typeof MergeFieldsMapping>;
