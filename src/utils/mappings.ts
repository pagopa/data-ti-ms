/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  BooleanMapping,
  CapitalizeMapping,
  ConvertFormatMapping,
  DataMapping,
  DateStringFromTimestampFormatMapping,
  DateStringToIsoFormatMapping,
  DateStringToTimestampFormatMapping,
  DateStringToUtcFormatMapping,
  DivideMapping,
  ExcludeInputExcludeFieldsMapping,
  IsoToUtcFormatMapping,
  LowerCaseMapping,
  MultipleInputMergeFieldMapping,
  MultiplyMapping,
  ReplaceAllMapping,
  ReplaceMapping,
  RoundMapping,
  SelectInputSelectFieldsMapping,
  TrimMapping,
  UpperCaseMapping
} from "@pagopa/data-indexer-commons";
import { SingleInputMapping } from "@pagopa/data-indexer-commons/lib/types/mapping/singleInput";

import { SwitchCaseMapping } from "@pagopa/data-indexer-commons/lib/types/mapping/case";

import * as t from "io-ts";
import { replaceFormat, trimFormat } from "../formatter/string";
import { booleanToString } from "../formatter/boolean";
import { divideNumber, multiplyNumber, roundNumber } from "../formatter/number";
import { applySingleInput } from "../formatter/apply";
import {
  capitalizeFormat,
  lowerCaseFormat,
  upperCaseFormat,
  replaceAllFormat
} from "../formatter/string";
import { switchCaseFormat } from "../formatter/case";
import {
  convertFormat,
  dateStringFromTimestampFormat,
  dateStringToIsoFormat,
  dateStringToTimeStampFormat,
  dateStringToUtcFormat,
  isoToUtcFormat
} from "../formatter/date";
import { flattenField } from "../formatter/flatten";
import { mergeFields } from "../formatter/mergeFields";
import { selectFields } from "../formatter/selectFields";
import { excludeFields } from "../formatter/excludeFields";
import { MappingFormatter } from "./types";

export interface IFormatterMapping<T> {
  readonly handler: (
    m?: Partial<typeof DataMapping._A>
  ) => MappingFormatter<T, unknown>;
  readonly pattern: t.Type<
    Partial<typeof DataMapping._A>,
    Partial<typeof DataMapping._O>
  >;
}
/**
const getHandler = (applier: ReturnType<typeof applySingleInput>) => ({
  BOOLEAN_TO_STRING: (m: BooleanMapping) =>
    applier(booleanToString(m.trueString, m.falseString)),
  CAPITALIZE: () => applier(capitalizeFormat),
  CONVERT_FORMAT: (m: ConvertFormatMapping) => applier(convertFormat(m.output)),
  DATE_FROM_TIMESTAMP: () => applier(dateStringFromTimestampFormat),
  DATE_TO_ISO: () => applier(dateStringToIsoFormat),
  DATE_TO_TIMESTAMP: () => applier(dateStringToTimeStampFormat),
  DATE_TO_UTC: () => applier(dateStringToUtcFormat),
  DIVIDE_NUMBER: (m: DivideMapping) => applier(divideNumber(m.divider)),
  FLATTEN: (m: SingleInputMapping) => flattenField(m.inputFieldName),
  ISO_TO_UTC: () => applier(isoToUtcFormat),
  LOWER_CASE: () => applier(lowerCaseFormat),
  MULTIPLY_NUMBER: (m: MultiplyMapping) =>
    applier(multiplyNumber(m.multiplier)),
  REPLACE: (m: ReplaceMapping) =>
    applier(replaceFormat(m.toBeReplaced, m.placeholder)),
  REPLACE_ALL: (m: ReplaceAllMapping) =>
    applier(replaceAllFormat(m.toBeReplaced, m.placeholder)),
  ROUND_NUMBER: (m: RoundMapping) => applier(roundNumber(m.decimals)),
  SWITCH_CASE: (m: SwitchCaseMapping) =>
    applier(switchCaseFormat(m.cases, m.defaultValue)),
  TRIM: () => applier(trimFormat),
  UPPER_CASE: () => applier(upperCaseFormat)
});
 */

export const singleInputFormatterHandlerMappings = <
  T extends Record<string, unknown>
>(
  applier: ReturnType<typeof applySingleInput>
): ReadonlyArray<IFormatterMapping<T>> => [
  {
    handler: (m: BooleanMapping) =>
      applier(booleanToString(m.trueString, m.falseString)),
    pattern: BooleanMapping
  },
  {
    handler: () => applier(capitalizeFormat),
    pattern: CapitalizeMapping
  },
  {
    handler: (m: ConvertFormatMapping) => applier(convertFormat(m.output)),
    pattern: ConvertFormatMapping
  },
  {
    handler: () => applier(dateStringFromTimestampFormat),
    pattern: DateStringFromTimestampFormatMapping
  },
  {
    handler: () => applier(dateStringToIsoFormat),
    pattern: DateStringToIsoFormatMapping
  },
  {
    handler: () => applier(dateStringToTimeStampFormat),
    pattern: DateStringToTimestampFormatMapping
  },
  {
    handler: () => applier(dateStringToUtcFormat),
    pattern: DateStringToUtcFormatMapping
  },
  {
    handler: (m: DivideMapping) => applier(divideNumber(m.divider)),
    pattern: DivideMapping
  },
  {
    handler: (m: SingleInputMapping) => flattenField(m.inputFieldName),
    pattern: SingleInputMapping
  },
  {
    handler: () => applier(isoToUtcFormat),
    pattern: IsoToUtcFormatMapping
  },
  {
    handler: () => applier(lowerCaseFormat),
    pattern: LowerCaseMapping
  },
  {
    handler: (m: MultiplyMapping) => applier(multiplyNumber(m.multiplier)),
    pattern: MultiplyMapping
  },
  {
    handler: (m: ReplaceMapping) =>
      applier(replaceFormat(m.toBeReplaced, m.placeholder)),
    pattern: ReplaceMapping
  },
  {
    handler: (m: ReplaceAllMapping) =>
      applier(replaceAllFormat(m.toBeReplaced, m.placeholder)),
    pattern: ReplaceAllMapping
  },
  {
    handler: (m: RoundMapping) => applier(roundNumber(m.decimals)),
    pattern: RoundMapping
  },
  {
    handler: (m: SwitchCaseMapping) =>
      applier(switchCaseFormat(m.cases, m.defaultValue)),
    pattern: SwitchCaseMapping
  },
  {
    handler: () => applier(trimFormat),
    pattern: TrimMapping
  },
  {
    handler: () => applier(upperCaseFormat),
    pattern: UpperCaseMapping
  }
];

export const multipleInputFormatterHandlerMappings = <
  T extends Record<string, unknown>
>(): ReadonlyArray<IFormatterMapping<T>> => [
  {
    handler: (m: MultipleInputMergeFieldMapping) =>
      mergeFields(
        m.inputOutputFields.map(el => el.inputFieldName),
        m.newFieldName,
        m.separator
      ),
    pattern: MultipleInputMergeFieldMapping
  }
];

export const selectInputFormatterHandlerMappings = <
  T extends Record<string, unknown>
>(): ReadonlyArray<IFormatterMapping<T>> => [
  {
    handler: (m: SelectInputSelectFieldsMapping) => selectFields(m.fields),
    pattern: SelectInputSelectFieldsMapping
  }
];

export const excludeInputFormatterHandlerMappings = <
  T extends Record<string, unknown>
>(): ReadonlyArray<IFormatterMapping<T>> => [
  {
    handler: (m: ExcludeInputExcludeFieldsMapping) => excludeFields(m.fields),
    pattern: ExcludeInputExcludeFieldsMapping
  }
];
