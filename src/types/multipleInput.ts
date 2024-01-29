import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";
import { MergeFieldsMapping } from "./mergeFields";

const inputType = t.type({
  type: t.literal("MULTIPLE_INPUT")
});

const Separator = t.partial({
  separator: t.string
});

const InputOutputField = t.intersection([
  t.type({
    inputFieldName: NonEmptyString
  }),
  t.partial({
    outputFieldName: NonEmptyString
  })
]);

const InputOutputFields = t.type({
  inputOutputFields: t.readonlyArray(InputOutputField)
});

export const MultipleInputConfig = t.intersection([
  inputType,
  Separator,
  InputOutputFields
]);

export const MultipleInputMergeFieldMapping = t.intersection([
  MultipleInputConfig,
  MergeFieldsMapping
]);

export const MultipleInputMapping = MultipleInputMergeFieldMapping;
