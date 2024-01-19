import * as E from "fp-ts/Either";
import { MergeFieldsMapping } from "../mergeFields";

describe("MergeFieldsMapping", () => {
  it("should validate the input and newField properties", () => {
    const validMapping = {
      input: {
        bar: 1,
        baz: "hello",
        foo: "Foo"
      },
      newField: "mergedField",
      field: ["foo", "bar"],
      mapper: "MERGE_FIELDS",
      separator: "-"
    };
    const result = MergeFieldsMapping.decode(validMapping);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if input is not an object", () => {
    const invalidMapping = {
      input: 1,
      newField: "mergedField",
      field: ["foo", "bar"],
      mapper: "MERGE_FIELDS",
      separator: "-"
    };
    const result = MergeFieldsMapping.decode(invalidMapping);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if newField is not a string", () => {
    const invalidMapping = {
      input: {
        bar: 1,
        baz: "hello",
        foo: "Foo"
      },
      newField: 1,
      field: ["foo", "bar"],
      mapper: "MERGE_FIELDS",
      separator: "-"
    };
    const result = MergeFieldsMapping.decode(invalidMapping);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if field is not an array", () => {
    const invalidMapping = {
      input: {
        bar: 1,
        baz: "hello",
        foo: "Foo"
      },
      newField: "mergedField",
      field: 1,
      mapper: "MERGE_FIELDS",
      separator: "-"
    };
    const result = MergeFieldsMapping.decode(invalidMapping);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if field elements are not keys of input", () => {
    const invalidMapping = {
      input: {
        bar: 1,
        baz: "hello",
        foo: "Foo"
      },
      newField: "mergedField",
      field: ["foooooo", "bar", "baz"],
      mapper: "MERGE_FIELDS",
      separator: "-"
    };
    const result = MergeFieldsMapping.decode(invalidMapping);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if mapper is not 'MERGE_FIELDS'", () => {
    const invalidMapping = {
      input: {
        bar: 1,
        baz: "hello",
        foo: "Foo"
      },
      newField: "mergedField",
      field: ["foo", "bar"],
      mapper: "INVALID_MAPPER",
      separator: "-"
    };
    const result = MergeFieldsMapping.decode(invalidMapping);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if separator is not a string", () => {
    const invalidMapping = {
      input: {
        bar: 1,
        baz: "hello",
        foo: "Foo"
      },
      newField: "mergedField",
      field: ["foo", "bar"],
      mapper: "MERGE_FIELDS",
      separator: 1
    };
    const result = MergeFieldsMapping.decode(invalidMapping);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should validate if separator is missing", () => {
    const validMapping = {
      input: {
        bar: 1,
        baz: "hello",
        foo: "Foo"
      },
      newField: "mergedField",
      field: ["foo", "bar"],
      mapper: "MERGE_FIELDS"
    };
    const result = MergeFieldsMapping.decode(validMapping);
    expect(E.isRight(result)).toBeTruthy();
  });
});
