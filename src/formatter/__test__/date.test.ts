import {
  convertFormat,
  dateStringFromTimestampFormat,
  dateStringToDateObject,
  dateStringToIsoFormat,
  dateStringToTimeStampFormat,
  dateStringToUtcFormat,
  isoToUtcFormat
} from "../date";

const isoStr = "2023-01-01T12:34:56.789Z";
const invalidIsoStr = "202301-01T12:34:56.789Z";
const dateStr = "2023-12-19";
const isoTimeZone = "2018-10-13T00:00:00.000+00:00";
const timestamp = 1702944000000;

describe("dateStringToUtcFormat", () => {
  it("should return a UTC string from a date string like: 2023-12-19", () => {
    const utc = dateStringToUtcFormat(dateStr);
    expect(utc).toEqual("Tue, 19 Dec 2023 00:00:00 GMT");
  });
  it("should return a UTC string from a ISO string", () => {
    const utc = dateStringToUtcFormat(isoStr);
    expect(utc).toEqual("Sun, 01 Jan 2023 12:34:56 GMT");
  });
  it("should return a UTC string from a IsoTimeZone string", () => {
    const utc = dateStringToUtcFormat(isoTimeZone);
    expect(utc).toEqual("Sat, 13 Oct 2018 00:00:00 GMT");
  });
  it("should return an error from an invalid ISO string", () => {
    const error = dateStringToUtcFormat(invalidIsoStr);
    expect(error).toEqual(
      'Invalid value "202301-01T12:34:56.789Z" supplied to : DateFromString'
    );
  });
});

describe("dateStringToDateObject", () => {
  it("should return a date object from a date string like: 2023-12-19", () => {
    const date = dateStringToDateObject(dateStr);
    expect(date).toEqual(new Date("2023-12-19"));
  });
  it("should return a date object from a ISO string", () => {
    const date = dateStringToDateObject(isoStr);
    expect(date).toEqual(new Date("2023-01-01T12:34:56.789Z"));
  });
  it("should return a date object from a IsoTimeZone string", () => {
    const date = dateStringToDateObject(isoTimeZone);
    expect(date).toEqual(new Date("2018-10-13T00:00:00.000+00:00"));
  });
});

describe("isoToUtcFormat", () => {
  it("should return a UTC string from a ISO string", () => {
    const utc = isoToUtcFormat(isoStr);
    expect(utc).toEqual("Sun, 01 Jan 2023 12:34:56 GMT");
  });
});

describe("dateStringToIsoFormat", () => {
  it("should return a ISO string from a date string like: 2023-12-19", () => {
    const iso = dateStringToIsoFormat(dateStr);
    expect(iso).toEqual("2023-12-19T00:00:00.000Z");
  });
});

describe("dateStringToTimeStampFormat", () => {
  it("should return a timestamp from a date string like: 2023-12-19", () => {
    const ts = dateStringToTimeStampFormat(dateStr);
    expect(ts).toEqual(ts);
  });
});

describe("dateStringFromTimestampFormat", () => {
  it("should return a date string from a timestamp", () => {
    const dateString = dateStringFromTimestampFormat(timestamp);
    expect(dateString).toEqual("Tue Dec 19 2023");
  });
});

describe("convertFormat", () => {
  it("should return a date string YYYY-MM-dd from a ISO string", () => {
    const dateString = convertFormat(isoStr, "YYYY-MM-dd");
    expect(dateString).toEqual("2023-01-01");
  });
  it("should return a date string YYYY-MM-dd hh:mm from a ISO string", () => {
    const dateString = convertFormat(isoStr, "YYYY-MM-dd hh:mm");
    expect(dateString).toEqual("2023-01-01 12:34");
  });
  it("should return a date string YYYY-MM-dd hh:mm:ss from a ISO string", () => {
    const dateString = convertFormat(isoStr, "YYYY-MM-dd hh:mm:ss");
    expect(dateString).toEqual("2023-01-01 12:34:56");
  });
});
