import * as E from "fp-ts/Either";
import { ConvertFormatMapping, DateMapping } from "../date";

describe("DateMapping", () => {
  it("should decode a correct DATE_TO_ISO type properly", () => {
    const validData = {
      mapper: "DATE_TO_ISO"
    };
    const res = DateMapping.decode(validData);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct DATE_TO_UTC type properly", () => {
    const validData = {
      mapper: "DATE_TO_UTC"
    };
    const res = DateMapping.decode(validData);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct ISO_TO_UTC type properly", () => {
    const validData = {
      mapper: "ISO_TO_UTC"
    };
    const res = DateMapping.decode(validData);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct DATE_TO_TIMESTAMP type properly", () => {
    const validData = {
      mapper: "DATE_TO_TIMESTAMP"
    };
    const res = DateMapping.decode(validData);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct DATE_FROM_TIMESTAMP type properly", () => {
    const validData = {
      mapper: "DATE_FROM_TIMESTAMP"
    };
    const res = DateMapping.decode(validData);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should not decode an invalid dateMapping type properly", () => {
    const invalidData = {
      mapper: "INVALID MAPPER"
    };
    const res = DateMapping.decode(invalidData);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should decode a valid ConvertFormatMapping type properly", () => {
    const validData = {
      mapper: "CONVERT_FORMAT",
      output: "yyyy-MM-dd"
    };
    const res = ConvertFormatMapping.decode(validData);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should not decode an invalid CONVERT_FORMAT type properly", () => {
    const invalidData = {
      mapper: "CONVERT_FORMAT",
      output: "INVALID FORMAT"
    };
    const res = ConvertFormatMapping.decode(invalidData);
    expect(E.isLeft(res)).toBeTruthy();
  });
});
