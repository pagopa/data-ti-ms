import * as t from "io-ts";
import { OutputFormat } from "../formatter/date";

const DateStringToUtcFormatMapping = t.type({
  mapper: t.literal("DATE_TO_UTC")
});

type DateStringToUtcFormatMapping = t.TypeOf<
  typeof DateStringToUtcFormatMapping
>;

const IsoToUtcFormatMapping = t.type({
  mapper: t.literal("ISO_TO_UTC")
});

type IsoToUtcFormatMapping = t.TypeOf<typeof IsoToUtcFormatMapping>;

const DateStringToIsoFormatMapping = t.type({
  mapper: t.literal("DATE_TO_ISO")
});
type DateStringToIsoFormatMapping = t.TypeOf<
  typeof DateStringToIsoFormatMapping
>;

const DateStringToTimestampFormatMapping = t.type({
  mapper: t.literal("DATE_TO_TIMESTAMP")
});
type DateStringToTimestampFormatMapping = t.TypeOf<
  typeof DateStringToTimestampFormatMapping
>;

const DateStringFromTimestampFormatMapping = t.type({
  mapper: t.literal("DATE_FROM_TIMESTAMP")
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

export type DateMapping = t.TypeOf<typeof DateMapping>;

export const ConvertFormatMapping = t.type({
  output: OutputFormat
});

export type ConvertFormatMapping = t.TypeOf<typeof ConvertFormatMapping>;
