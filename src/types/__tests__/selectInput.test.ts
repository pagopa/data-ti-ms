import * as E from "fp-ts/Either";
import { SelectInputMapping } from "../selectInput";

describe("SelectInputMapping", () => {
  it("should decode if config is a valid SelectInputMapping", () => {
    const validData = {
      mapper: "SELECT_FIELDS",
      type: "SELECT_INPUT",
      fields: ["foo", "bar"]
    };
    const result = SelectInputMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if mapper is not 'SELECT FIELDS'", () => {
    const invalidData = {
      mapper: "INVALID_MAPPER",
      fields: ["foo", "bar"],
      type: "SELECT_INPUT"
    };
    const result = SelectInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if type is not 'SELECT_INPUT'", () => {
    const invalidData = {
      mapper: "SELECT_FIELDS",
      fields: ["foo", "bar"],
      type: "INVALID_TYPE"
    };
    const result = SelectInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if fields are empty strings", () => {
    const invalidData = {
      mapper: "SELECT_FIELDS",
      fields: ["", ""],
      type: "SELECT_INPUT"
    };
    const result = SelectInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if fields are not strings", () => {
    const invalidData = {
      mapper: "SELECT_FIELDS",
      fields: [1, 2],
      type: "SELECT_INPUT"
    };
    const result = SelectInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
