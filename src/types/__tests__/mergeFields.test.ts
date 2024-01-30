import * as E from "fp-ts/Either";
import { MergeFieldsMapping } from "../mergeFields";

describe("MergeFieldsMapping", () => {
  it("should decode if config is a valid MergeFieldsMapping", () => {
    const validData = {
      mapper: "MERGE_FIELDS",
      newFieldName: "mergedField"
    };
    const result = MergeFieldsMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if config is not a valid input", () => {
    const invalidData = {
      invalidNewFieldName: "foo",
      mapper: "MERGE_FIELDS"
    };
    const result = MergeFieldsMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if mapper is not 'MERGE_FIELDS'", () => {
    const invalidData = {
      newFieldName: "foo",
      mapper: "INVALID_MAPPER"
    };
    const result = MergeFieldsMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
