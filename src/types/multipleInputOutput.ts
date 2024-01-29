import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";
import { RenameFieldsMapping } from "./renameField";

const InputOutputField = t.type({
  inputFieldName: NonEmptyString,
  outputFieldName: NonEmptyString
});

export const MultipleInputOutputConfig = t.type({
  inputOutputFields: t.readonlyArray(InputOutputField),
  type: t.literal("MULTIPLE_INPUT_OUTPUT")
});

export const MultipleInputOutputRenameFieldsMapping = t.intersection([
  MultipleInputOutputConfig,
  RenameFieldsMapping
]);

export const MultipleInputOutputMapping = MultipleInputOutputRenameFieldsMapping;
