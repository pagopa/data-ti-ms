import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import {
  convertFormat,
  dateStringFromTimestampFormat,
  dateStringToIsoFormat,
  dateStringToTimeStampFormat,
  dateStringToUtcFormat,
  isoToUtcFormat
} from "../date";

const isoStr = "2023-01-01T12:34:56.789Z";
const invalidIsoStr = "202301-01T12:34:56.789Z";
const dateStr = "2023-12-19";
const invalidDateString = "202313-19";
const isoTimeZone = "2018-10-13T00:00:00.000+00:00";
const timestamp = 1702944000000;
const invalidTimestamp = "Invalid timestamp";
const invalidOutputFormat = "YYY-MM-dd";
const outputFormat1 = "yyyy-MM-dd";

const invalidIsoStringError = (err: Error): void => {
  expect(err).toBeDefined();
  expect(err.message).toEqual(expect.stringContaining("Invalid iso string"));
};

const testFail = (): void => fail("it should not reach here");

const invalidDateStringError = (err: Error): void => {
  expect(err).toBeDefined();
  expect(err.message).toEqual(expect.stringContaining("Invalid date string"));
};

describe("dateStringToUtcFormat", () => {
  it("should return a UTC string from a date string like: 2023-12-19", () => {
    pipe(
      dateStringToUtcFormat(dateStr),
      E.bimap(testFail, result =>
        expect(result).toEqual("Tue, 19 Dec 2023 00:00:00 GMT")
      )
    );
  });
  it("should return a UTC string from a ISO string", () => {
    pipe(
      dateStringToUtcFormat(isoStr),
      E.bimap(testFail, result =>
        expect(result).toEqual("Sun, 01 Jan 2023 12:34:56 GMT")
      )
    );
  });
  it("should return a UTC string from a IsoTimeZone string", () => {
    pipe(
      dateStringToUtcFormat(isoTimeZone),
      E.bimap(testFail, result =>
        expect(result).toEqual("Sat, 13 Oct 2018 00:00:00 GMT")
      )
    );
  });
  it("should return an error from a not valid ISO string", () => {
    pipe(
      dateStringToUtcFormat(invalidIsoStr),
      E.bimap(invalidDateStringError, testFail)
    );
  });
});

describe("isoToUtcFormat", () => {
  it("should return a UTC string from a ISO string", () => {
    pipe(
      isoToUtcFormat(isoStr),
      E.bimap(testFail, result =>
        expect(result).toEqual("Sun, 01 Jan 2023 12:34:56 GMT")
      )
    );
  });
  it("should return an error from an invalid ISO string", () => {
    pipe(
      isoToUtcFormat(invalidIsoStr),
      E.bimap(invalidIsoStringError, testFail)
    );
  });
});

describe("dateStringToIsoFormat", () => {
  it("should return a ISO string from a date string like: 2023-12-19", () => {
    pipe(
      dateStringToIsoFormat(dateStr),
      E.bimap(testFail, result =>
        expect(result).toEqual("2023-12-19T00:00:00.000Z")
      )
    );
  });
  it("should return an error from an invalid date string", () => {
    pipe(
      dateStringToIsoFormat(invalidDateString),
      E.bimap(invalidDateStringError, testFail)
    );
  });
});

describe("dateStringToTimeStampFormat", () => {
  it("should return a timestamp from a date string like: 2023-12-19", () => {
    pipe(
      dateStringToTimeStampFormat(dateStr),
      E.bimap(testFail, result => expect(result).toEqual(timestamp))
    );
  });
  it("should return an error from an invalid date string", () => {
    pipe(
      dateStringToTimeStampFormat(invalidIsoStr),
      E.bimap(invalidDateStringError, testFail)
    );
  });
});

describe("dateStringFromTimestampFormat", () => {
  it("should return a date string from a timestamp", () => {
    pipe(
      dateStringFromTimestampFormat(timestamp),
      E.bimap(testFail, result => expect(result).toEqual("Tue Dec 19 2023"))
    );
  });
  it("should return an error from an invalid timestamp", () => {
    pipe(
      dateStringFromTimestampFormat((invalidTimestamp as unknown) as number),
      E.bimap(err => {
        expect(err).toBeDefined();
        expect(err.message).toEqual(
          expect.stringContaining("Invalid timestamp")
        );
      }, testFail)
    );
  });
});

describe("convertFormat", () => {
  it("should return a date string YYYY-MM-dd from a ISO string", () => {
    pipe(
      convertFormat(outputFormat1)(isoStr),
      E.bimap(testFail, result => expect(result).toEqual("2023-01-01"))
    );
  });
  it("should return a date string YYYY-MM-dd hh:mm from a ISO string", () => {
    pipe(
      convertFormat("yyyy-MM-dd HH:mm")(isoStr),
      E.bimap(testFail, result => expect(result).toEqual("2023-01-01 12:34"))
    );
  });
  it("should return a date string YYYY-MM-dd hh:mm:ss from a ISO string", () => {
    pipe(
      convertFormat("yyyy-MM-dd HH:mm:ss")(isoStr),
      E.bimap(testFail, result => expect(result).toEqual("2023-01-01 12:34:56"))
    );
  });
  it("should return an error from an invalid ISO string", () => {
    pipe(
      convertFormat(outputFormat1)(invalidIsoStr),
      E.bimap(invalidIsoStringError, testFail)
    );
  });
  it("should return an error from an invalid outputFormat", () => {
    pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      convertFormat(invalidOutputFormat as any)(isoStr),
      E.bimap(err => {
        expect(err).toBeDefined();
        expect(err.message).toEqual(
          expect.stringContaining("Invalid output format")
        );
      }, testFail)
    );
  });
});
