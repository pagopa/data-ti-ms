import {
  DateFromString,
  DateFromTimestamp,
  UtcOnlyIsoDateFromString
} from "@pagopa/ts-commons/lib/dates";
import { OutputFormat } from "@pagopa/data-indexer-commons";
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

const DateComponents = t.type({
  day: t.string,
  hours: t.string,
  minutes: t.string,
  month: t.string,
  seconds: t.string,
  year: t.string
});
type DateComponents = t.TypeOf<typeof DateComponents>;

const interpolateDateString = (
  dateComponents: DateComponents,
  outputFormat: OutputFormat
): string => {
  const { year, month, day, hours, minutes, seconds } = dateComponents;
  switch (outputFormat) {
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`;
    case "yyyy-MM-dd HH:mm":
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case "yyyy-MM-dd HH:mm:ss":
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      throw new Error("Unexpected OutputFormat");
  }
};

export const convertFormat = (output: OutputFormat) => (
  isoString: string
): E.Either<Error, string> =>
  pipe(
    output,
    OutputFormat.decode,
    E.mapLeft(errs =>
      Error(`Invalid output format|Error=${errorsToReadableMessages(errs)}`)
    ),
    E.chain(outputFormat =>
      pipe(
        isoString,
        DateFromString.decode,
        E.bimap(
          errs =>
            Error(`Invalid iso string|Error=${errorsToReadableMessages(errs)}`),
          date => ({
            day: String(date.getUTCDate()).padStart(2, "0"),
            hours: String(date.getUTCHours()).padStart(2, "0"),
            minutes: String(date.getUTCMinutes()).padStart(2, "0"),
            month: String(date.getUTCMonth() + 1).padStart(2, "0"),
            seconds: String(date.getUTCSeconds()).padStart(2, "0"),
            year: String(date.getUTCFullYear())
          })
        ),
        E.chain(dateComponents =>
          E.tryCatch(
            () => interpolateDateString(dateComponents, outputFormat),
            E.toError
          )
        )
      )
    )
  );
