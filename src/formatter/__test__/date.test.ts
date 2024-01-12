import * as E from "fp-ts/Either";
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
const invalidOutputFormat = "YYY-MM-dd";
const outputFormat1 = "YYYY-MM-dd";
const invalidDateStringError = new Error("Invalid dateString");

describe("dateStringToUtcFormat", () => {
  it("should return a UTC string from a date string like: 2023-12-19", () => {
    const utc = dateStringToUtcFormat(dateStr);
    expect(utc).toEqual(E.right("Tue, 19 Dec 2023 00:00:00 GMT"));
  });
  it("should return a UTC string from a ISO string", () => {
    const utc = dateStringToUtcFormat(isoStr);
    expect(utc).toEqual(E.right("Sun, 01 Jan 2023 12:34:56 GMT"));
  });
  it("should return a UTC string from a IsoTimeZone string", () => {
    const utc = dateStringToUtcFormat(isoTimeZone);
    expect(utc).toEqual(E.right("Sat, 13 Oct 2018 00:00:00 GMT"));
  });
  it("should return an error from a not valid ISO string", () => {
    const error = dateStringToUtcFormat(invalidIsoStr);
    expect(error).toEqual(E.left(invalidDateStringError));
  });
});

describe("isoToUtcFormat", () => {
  it("should return a UTC string from a ISO string", () => {
    const utc = isoToUtcFormat(isoStr);
    expect(utc).toEqual(E.right("Sun, 01 Jan 2023 12:34:56 GMT"));
  });
  it("should return an error from an invalid ISO string", () => {
    const error = isoToUtcFormat(invalidIsoStr);
    expect(error).toEqual(E.left(new Error("Invalid isoString")));
  });
});

describe("dateStringToIsoFormat", () => {
  it("should return a ISO string from a date string like: 2023-12-19", () => {
    const iso = dateStringToIsoFormat(dateStr);
    expect(iso).toEqual(E.right("2023-12-19T00:00:00.000Z"));
  });
  it("should return an error from an invalid date string", () => {
    const error = dateStringToIsoFormat(invalidDateString);
    expect(error).toEqual(E.left(invalidDateStringError));
  });
});

describe("dateStringToTimeStampFormat", () => {
  it("should return a timestamp from a date string like: 2023-12-19", () => {
    const ts = dateStringToTimeStampFormat(dateStr);
    expect(ts).toEqual(E.right(timestamp));
  });
  it("should return an error from an invalid date string", () => {
    const error = dateStringToTimeStampFormat(invalidDateString);
    expect(error).toEqual(E.left(invalidDateStringError));
  });
});

describe("dateStringFromTimestampFormat", () => {
  it("should return a date string from a timestamp", () => {
    const dateString = dateStringFromTimestampFormat(timestamp);
    expect(dateString).toEqual(E.right("Tue Dec 19 2023"));
  });
});

describe("convertFormat", () => {
  it("should return a date string YYYY-MM-dd from a ISO string", () => {
    const dateString = convertFormat(isoStr, outputFormat1);
    expect(dateString).toEqual(E.right("2023-01-01"));
  });
  it("should return a date string YYYY-MM-dd hh:mm from a ISO string", () => {
    const dateString = convertFormat(isoStr, "YYYY-MM-dd hh:mm");
    expect(dateString).toEqual(E.right("2023-01-01 12:34"));
  });
  it("should return a date string YYYY-MM-dd hh:mm:ss from a ISO string", () => {
    const dateString = convertFormat(isoStr, "YYYY-MM-dd hh:mm:ss");
    expect(dateString).toEqual(E.right("2023-01-01 12:34:56"));
  });
  it("should return an error from an invalid ISO string", () => {
    const error = convertFormat(invalidIsoStr, outputFormat1);
    expect(error).toEqual(E.left(new Error("Invalid isoString")));
  });
  it("should return an error from an invalid outputFormat", () => {
    const error = convertFormat(isoStr, invalidOutputFormat as "YYYY-MM-dd");
    expect(error).toEqual(E.left(new Error("Invalid output format")));
  });
});
