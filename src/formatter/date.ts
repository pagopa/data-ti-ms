import {
  DateFromString,
  DateFromTimestamp,
  UtcOnlyIsoDateFromString
} from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";
import * as t from "io-ts";
import { failure } from "io-ts/PathReporter";

const onLeft = (errors: t.Errors): string =>
  pipe(failure(errors), e => e.join("\n"));

export const dateStringToUtcFormat = (dateString: string): string =>
  pipe(
    dateString,
    DateFromString.decode,
    E.match(onLeft, date => date.toUTCString())
  );

export const dateStringToDateObject = (dateString: string): string | Date =>
  pipe(dateString, DateFromString.decode, E.getOrElseW(onLeft));

export const isoToUtcFormat = (isoString: string): string =>
  pipe(
    isoString,
    UtcOnlyIsoDateFromString.decode,
    E.match(onLeft, date => date.toUTCString())
  );

export const dateStringToIsoFormat = (dateString: string): string =>
  pipe(
    dateString,
    DateFromString.decode,
    E.match(onLeft, date => date.toISOString())
  );

export const dateStringToTimeStampFormat = (
  dateString: string
): string | number =>
  pipe(
    dateString,
    DateFromString.decode,
    E.matchW(onLeft, date => date.getTime())
  );

export const dateStringFromTimestampFormat = (ts: number): string =>
  pipe(
    ts,
    DateFromTimestamp.decode,
    E.matchW(onLeft, date => date.toDateString())
  );

const OutputFormat = t.union([
  t.literal("YYYY-MM-dd"),
  t.literal("YYYY-MM-dd hh:mm"),
  t.literal("YYYY-MM-dd hh:mm:ss")
]);

type OutputFormat = t.TypeOf<typeof OutputFormat>;

export const convertFormat = (
  isoString: string,
  output: OutputFormat
): string =>
  pipe(
    output,
    OutputFormat.decode,
    E.mapLeft(onLeft),
    E.flatMap(outputFormat =>
      pipe(
        isoString,
        DateFromString.decode,
        E.bimap(onLeft, date => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");

          if (outputFormat === "YYYY-MM-dd") {
            return `${year}-${month}-${day}`;
          }
          if (outputFormat === "YYYY-MM-dd hh:mm") {
            return `${year}-${month}-${day} ${hours}:${minutes}`;
          }
          if (outputFormat === "YYYY-MM-dd hh:mm:ss") {
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          }
        })
      )
    ),
    E.getOrElse(identity)
  );
