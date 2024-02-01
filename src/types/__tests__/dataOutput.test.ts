import * as E from "fp-ts/Either";
import { DataOutput } from "../dataOutput";

describe("DataOutput", () => {
  it("should decode if config is a valid DataOutput", () => {
    const validData = {
      connectionString: "connectionString",
      indexName: "indexName",
      type: "DATA_OUTPUT",
      deduplicationStrategy: "TIMESTAMP"
    };
    const result = DataOutput.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if connectionString is not a valid input", () => {
    const invalidData = {
      connectionString: 123,
      indexName: "indexName",
      type: "DATA_OUTPUT"
    };
    const result = DataOutput.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if connectionString is an empty string", () => {
    const invalidData = {
      connectionString: "",
      indexName: "indexName",
      type: "DATA_OUTPUT"
    };
    const result = DataOutput.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if indexName is not a valid input", () => {
    const invalidData = {
      connectionString: "connectionString",
      indexName: 123,
      type: "DATA_OUTPUT"
    };
    const result = DataOutput.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if indexName is an empty string", () => {
    const invalidData = {
      connectionString: "connectionString",
      indexName: "",
      type: "DATA_OUTPUT"
    };
    const result = DataOutput.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if type is not 'DATA_OUTPUT'", () => {
    const invalidData = {
      connectionString: "connectionString",
      indexName: "indexName",
      type: "INVALID_TYPE"
    };
    const result = DataOutput.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if deduplicationStrategy is not 'TIMESTAMP'", () => {
    const invalidData = {
      connectionString: "connectionString",
      indexName: "indexName",
      type: "DATA_OUTPUT",
      deduplicationStrategy: "INVALID"
    };
    const result = DataOutput.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
