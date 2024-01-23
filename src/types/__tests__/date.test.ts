import * as E from "fp-ts/Either";
import { DateMapping } from "../date";

describe("DateMapping", () => {
  it("should decode a correct dateMapping type properly", () => {
    const validData = {
      inputFieldName: "foo",
      dateString: "2023-12-19",
      mapper: "DATE_TO_ISO"
    };
    const res = DateMapping.decode(validData);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should not decode an invalid dateMapping type properly", () => {
    const invalidData = {
      inputFieldName: "foo",
      dateString: "2023-12-19",
      mapper: "INVALID MAPPER"
    };
    const res = DateMapping.decode(invalidData);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should not decode if dateString is not a string", () => {
    const invalidData = {
      inputFieldName: "foo",
      dateString: 2023 - 12 - 19,
      mapper: "DATE_TO_ISO"
    };
    const res = DateMapping.decode(invalidData);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should not decode if inpuFieldName is missing", () => {
    const invalidData = {
      dateString: "2023-12-19",
      mapper: "DATE_TO_ISO"
    };
    const res = DateMapping.decode(invalidData);
    expect(E.isLeft(res)).toBeTruthy();
  });
});
