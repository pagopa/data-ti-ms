import * as t from "io-ts";
import { BooleanMapping } from "./boolean";
import { SwitchCaseMapping } from "./case";
import { NumberMapping } from "./number";
import { RenameFieldMapping } from "./renameField";
import { StringMapping } from "./string";

const inputType = t.type({
  type: t.literal("SINGLE_INPUT")
});

const OutputFieldName = t.partial({
  outputFieldName: t.string
});

export const SingleInputConfig = t.intersection([inputType, OutputFieldName]);

export const SingleInputNumberMapping = t.intersection([
  SingleInputConfig,
  NumberMapping
]);

export const SingleInputStringMapping = t.intersection([
  SingleInputConfig,
  StringMapping
]);

export const SingleInputBooleanMapping = t.intersection([
  SingleInputConfig,
  BooleanMapping
]);

export const SingleInputRenameFieldMapping = t.intersection([
  SingleInputConfig,
  RenameFieldMapping
]);

export const SingleInputSwitchCaseMapping = t.intersection([
  SingleInputConfig,
  SwitchCaseMapping
]);

export const SingleInputMapping = t.union([
  SingleInputNumberMapping,
  SingleInputStringMapping,
  SingleInputBooleanMapping,
  SingleInputRenameFieldMapping,
  SingleInputSwitchCaseMapping
]);

export type SingleInputMapping = t.TypeOf<typeof SingleInputMapping>;