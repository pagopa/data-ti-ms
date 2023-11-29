import {
  capitalizeFormat,
  lowerCaseFormat,
  replaceAllFormat,
  replaceFormat,
  trimFormat,
  upperCaseFormat
} from "../string";

const aString = "alowerstring";
describe("UpperCaseFormat", () => {
  it("should uppercase a lower string", () => {
    const res = upperCaseFormat(aString);
    expect(res).toEqual(aString.toUpperCase());
  });

  it("should uppercase an empty string", () => {
    const res = upperCaseFormat("");
    expect(res).toEqual("");
  });
});

describe("LowerCaseFormat", () => {
  it("should lowercase an upper string", () => {
    const res = lowerCaseFormat(aString.toUpperCase());
    expect(res).toEqual(aString);
  });

  it("should lowercase an empty string", () => {
    const res = lowerCaseFormat("");
    expect(res).toEqual("");
  });
});

describe("CapitalizeFormat", () => {
  it("should capitalize a string", () => {
    const res = capitalizeFormat(aString);
    expect(res).toEqual(`${aString[0].toUpperCase() + aString.slice(1)}`);
  });

  it("should capitalize a single char", () => {
    const res = capitalizeFormat("a");
    expect(res).toEqual("A");
  });

  it("should capitalize an empty string", () => {
    const res = capitalizeFormat("");
    expect(res).toEqual("");
  });
});

describe("TrimFormat", () => {
  it("should trim a string", () => {
    const res = trimFormat(` ${aString} `);
    expect(res).toEqual(aString);
  });

  it("should trim an empty string", () => {
    const res = trimFormat("");
    expect(res).toEqual("");
  });
});

describe("ReplaceFormat", () => {
  it("should replace the first occurrence of a static string", () => {
    const res = replaceFormat(aString)("a", "the");
    expect(res).toEqual("thelowerstring");
  });

  it("should replace the first occurrence of a static string even if this string is repeated", () => {
    const res = replaceFormat(aString)("r", "w");
    expect(res).toEqual("alowewstring");
  });
});

describe("ReplaceAllFormat", () => {
  it("should replace all occurrences of a static string", () => {
    const res = replaceAllFormat(aString)("r", "w");
    expect(res).toEqual("alowewstwing");
  });

  it("should return no modified string if input is empty", () => {
    const res = replaceAllFormat("")("r", "w");
    expect(res).toEqual("");
  });
});
