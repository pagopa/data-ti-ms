import {
  DateFromString,
  DateFromTimestamp,
  UtcOnlyIsoDateFromString
} from "@pagopa/ts-commons/lib/dates";
import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";

const invalidDateStringError = (errs: t.Errors): Error =>
  Error(`Invalid date string|Error=${errorsToReadableMessages(errs)}`);

export const dateStringToUtcFormat = (
  dateString: string
): E.Either<Error, string> =>
  pipe(
    dateString,
    DateFromString.decode,
    E.bimap(invalidDateStringError, date => date.toUTCString())
  );

export const isoToUtcFormat = (isoString: string): E.Either<Error, string> =>
  pipe(
    isoString,
    UtcOnlyIsoDateFromString.decode,
    E.bimap(
      errs =>
        Error(`Invalid iso string|Error=${errorsToReadableMessages(errs)}`),
      date => date.toUTCString()
    )
  );

export const dateStringToIsoFormat = (
  dateString: string
): E.Either<Error, string> =>
  pipe(
    dateString,
    DateFromString.decode,
    E.bimap(invalidDateStringError, date => date.toISOString())
  );

export const dateStringToTimeStampFormat = (
  dateString: string
): E.Either<Error, number> =>
  pipe(
    dateString,
    DateFromString.decode,
    E.bimap(invalidDateStringError, date => date.getTime())
  );

export const dateStringFromTimestampFormat = (
  ts: number
): E.Either<Error, string> =>
  pipe(
    ts,
    DateFromTimestamp.decode,
    E.bimap(
      errs =>
        Error(`Invalid timestamp|Error=${errorsToReadableMessages(errs)}`),
      date => date.toDateString()
    )
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
): E.Either<Error, string> =>
  pipe(
    output,
    OutputFormat.decode,
    E.mapLeft(errs =>
      Error(`Invalid output format|Error=${errorsToReadableMessages(errs)}`)
    ),
    E.flatMap(outputFormat =>
      pipe(
        isoString,
        DateFromString.decode,
        E.bimap(
          errs =>
            Error(`Invalid iso string|Error=${errorsToReadableMessages(errs)}`),
          date => {
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            const hours = String(date.getUTCHours()).padStart(2, "0");
            const minutes = String(date.getUTCMinutes()).padStart(2, "0");
            const seconds = String(date.getUTCSeconds()).padStart(2, "0");

            if (outputFormat === "YYYY-MM-dd") {
              return `${year}-${month}-${day}`;
            }
            if (outputFormat === "YYYY-MM-dd hh:mm") {
              return `${year}-${month}-${day} ${hours}:${minutes}`;
            }
            if (outputFormat === "YYYY-MM-dd hh:mm:ss") {
              return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }
          }
        )
      )
    )
  );
