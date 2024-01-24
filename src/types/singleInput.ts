import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";
import { BooleanMapping } from "./boolean";
import { SwitchCaseMapping } from "./case";
import { DateMapping } from "./date";
import { FlattenMapping } from "./flatten";
import { NumberMapping } from "./number";
import { RenameFieldMapping } from "./renameField";
import { StringMapping } from "./string";

const inputType = t.type({
  type: t.literal("SINGLE_INPUT")
});

const inputFieldName = t.type({
  inputFieldName: NonEmptyString
});

const OutputFieldName = t.partial({
  outputFieldName: t.string
});

export const SingleInputConfig = t.intersection([
  inputType,
  inputFieldName,
  OutputFieldName
]);

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

export const SingleInputDateMapping = t.intersection([
  SingleInputConfig,
  DateMapping
]);

export const SingleInputFlattenMapping = t.intersection([
  SingleInputConfig,
  FlattenMapping
]);

export const SingleInputMapping = t.union([
  SingleInputNumberMapping,
  SingleInputStringMapping,
  SingleInputBooleanMapping,
  SingleInputRenameFieldMapping,
  SingleInputSwitchCaseMapping,
  SingleInputDateMapping,
  SingleInputFlattenMapping
]);

export type SingleInputMapping = t.TypeOf<typeof SingleInputMapping>;
