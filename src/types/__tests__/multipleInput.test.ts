import * as E from "fp-ts/Either";
import { MultipleInputMapping } from "../multipleInput";

describe("MultipleInputMapping", () => {
  it("should decode if config is a valid MultipleInputMapping", () => {
    const validData = {
      mapper: "MERGE_FIELDS",
      type: "MULTIPLE_INPUT",
      newFieldName: "mergedField",
      inputOutputFields: [
        {
          inputFieldName: "foo",
          outputFieldName: "bar"
        }
      ],
      separator: "-"
    };
    const result = MultipleInputMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not decode if newFieldName is missing", () => {
    const invalidData = {
      mapper: "MERGE_FIELDS",
      type: "MULTIPLE_INPUT",
      inputOutputFields: [
        {
          inputFieldName: "foo",
          outputFieldName: "bar"
        }
      ]
    };
    const result = MultipleInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if mapper is not 'MERGE_FIELDS'", () => {
    const invalidData = {
      newFieldName: "foo",
      mapper: "INVALID_MAPPER",
      inputOutputFields: [
        {
          inputFieldName: "foo",
          outputFieldName: "bar"
        }
      ],
      type: "MULTIPLE_INPUT"
    };
    const result = MultipleInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if inputOutputFields is not an array", () => {
    const invalidData = {
      newFieldName: "foo",
      mapper: "MERGE_FIELDS",
      inputOutputFields: "foo",
      type: "MULTIPLE_INPUT"
    };
    const result = MultipleInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if inputOutputFields is not an array of objects with fields inputFieldName and outputFieldName", () => {
    const invalidData = {
      newFieldName: "foo",
      mapper: "MERGE_FIELDS",
      inputOutputFields: [
        {
          invalidInputFieldName: "foo",
          outputFieldName: "bar"
        }
      ],
      type: "MULTIPLE_INPUT"
    };
    const result = MultipleInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if separator is not a string", () => {
    const invalidData = {
      newFieldName: "foo",
      mapper: "MERGE_FIELDS",
      inputOutputFields: [
        {
          inputFieldName: "foo",
          outputFieldName: "bar"
        }
      ],
      separator: 123,
      type: "MULTIPLE_INPUT"
    };
    const result = MultipleInputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
