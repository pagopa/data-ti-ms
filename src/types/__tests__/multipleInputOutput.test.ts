import * as E from "fp-ts/Either";
import { MultipleInputOutputMapping } from "../multipleInputOutput";

describe("MultipleInputOutputMapping", () => {
  it("should validate if config is a valid MultipleInputOutputMapping", () => {
    const validData = {
      inputOutputFields: [
        {
          inputFieldName: "foo",
          outputFieldName: "bar"
        },
        {
          inputFieldName: "foo2",
          outputFieldName: "bar2"
        }
      ],
      mapper: "RENAME_FIELDS",
      type: "MULTIPLE_INPUT_OUTPUT"
    };
    const result = MultipleInputOutputMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if config is not a valid MultipleInputOutputMapping", () => {
    const invalidData = {
      inputOutputFields: [
        {
          inputFieldName: "foo"
        }
      ],
      mapper: "RENAME_FIELDS",
      type: "MULTIPLE_INPUT_OUTPUT"
    };
    const result = MultipleInputOutputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if inputOutputFields is not an array", () => {
    const invalidData = {
      inputOutputFields: "foo",
      mapper: "RENAME_FIELDS",
      type: "MULTIPLE_INPUT_OUTPUT"
    };
    const result = MultipleInputOutputMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
