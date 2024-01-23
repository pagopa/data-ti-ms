import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

const DateStringToUtcFormatMapping = t.type({
  dateString: NonEmptyString,
  inputFieldName: NonEmptyString,
  mapper: t.literal("DATE_TO_UTC")
});

type DateStringToUtcFormatMapping = t.TypeOf<
  typeof DateStringToUtcFormatMapping
>;

const IsoToUtcFormatMapping = t.type({
  inputFieldName: NonEmptyString,
  isoString: NonEmptyString,
  mapper: t.literal("ISO_TO_UTC")
});

type IsoToUtcFormatMapping = t.TypeOf<typeof IsoToUtcFormatMapping>;

const DateStringToIsoFormatMapping = t.type({
  dateString: NonEmptyString,
  inputFieldName: NonEmptyString,
  mapper: t.literal("DATE_TO_ISO")
});
type DateStringToIsoFormatMapping = t.TypeOf<
  typeof DateStringToIsoFormatMapping
>;

const DateStringToTimestampFormatMapping = t.type({
  dateString: NonEmptyString,
  inputFieldName: NonEmptyString,
  mapper: t.literal("DATE_TO_TIMESTAMP")
});
type DateStringToTimestampFormatMapping = t.TypeOf<
  typeof DateStringToTimestampFormatMapping
>;

const DateStringFromTimestampFormatMapping = t.type({
  inputFieldName: NonEmptyString,
  mapper: t.literal("DATE_FROM_TIMESTAMP"),
  timestamp: t.number
});

type DateStringFromTimestampFormatMapping = t.TypeOf<
  typeof DateStringFromTimestampFormatMapping
>;

export const DateMapping = t.union([
  DateStringToUtcFormatMapping,
  IsoToUtcFormatMapping,
  DateStringToIsoFormatMapping,
  DateStringToTimestampFormatMapping,
  DateStringFromTimestampFormatMapping
]);
