import * as E from "fp-ts/Either";
import { SelectFieldsMapping } from "../selectFields";

describe("SelectFieldsMapping", () => {
  it("should decode if config is a valid SelectFieldsMapping", () => {
    const validData = {
      mapper: "SELECT_FIELDS"
    };
    const result = SelectFieldsMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if config is not a valid input", () => {
    const invalidData = {
      mapper: "INVALID_MAPPER"
    };
    const result = SelectFieldsMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
