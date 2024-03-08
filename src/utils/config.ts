/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  BooleanMapping,
  Configuration,
  ConvertFormatMapping,
  DataMapping,
  DivideMapping,
  MultiplyMapping,
  ReplaceAllMapping,
  ReplaceMapping,
  RoundMapping
} from "@pagopa/data-indexer-commons";
import { SingleInputMapping } from "@pagopa/data-indexer-commons/lib/types/mapping/singleInput";

import { SwitchCaseMapping } from "@pagopa/data-indexer-commons/lib/types/mapping/case";

import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { MappingFormatter } from "../formatter/types";
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
export const mapperHandler = <T extends Record<string, unknown>>(
  singleInputMapping: SingleInputMapping
): MappingFormatter<T, unknown> =>
  pipe(
    applySingleInput(
      singleInputMapping.inputFieldName,
      singleInputMapping.outputFieldName
    ),
    applier => getHandler(applier),
    mapping => mapping[singleInputMapping.mapper](singleInputMapping)
  );

export const mapFormatting = <T extends Record<string, unknown>>(
  mapping: DataMapping
): MappingFormatter<T, unknown> => {
  switch (mapping.type) {
    case "SINGLE_INPUT":
      return mapperHandler(mapping);
    case "MULTIPLE_INPUT":
    case "SELECT_INPUT":
    case "EXCLUDE_INPUT":
    default:
      throw Error("Not mapped!");
  }
};

export const constructDataPipelineHandlers = (config: Configuration) =>
  pipe(
    config.dataPipelines,
    RA.map(pipeline =>
      pipe(
        pipeline.dataTransformation,
        RA.map(
          flow(
            O.fromNullable,
            O.chain(O.fromPredicate(RA.isEmpty)),
            O.map(_ =>
              pipe(
                _.dataMapping,
                O.fromNullable,
                O.map(RA.map(mapFormatting)),
                O.getOrElse(() => [])
              )
            )
          )
        )
      )
    )
  );
