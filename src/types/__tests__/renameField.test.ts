import * as E from "fp-ts/Either";
import { RenameFieldMapping } from "../renameField";

describe("RenameFieldMapping", () => {
  it("should validate", () => {
    const validData = {
      field: "foo",
      input: { foo: "bar" },
      newField: "fooo",
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if field is not in input", () => {
    const invalidData = {
      field: "foo",
      input: { bar: "bar" },
      newField: "fooo",
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if newField is already in input", () => {
    const invalidData = {
      field: "foo",
      input: { foo: "bar", fooo: "bar" },
      newField: "fooo",
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if mapper is not 'RENAME_FIELD'", () => {
    const invalidData = {
      field: "foo",
      input: { foo: "bar" },
      newField: "fooo",
      mapper: "INVALID_MAPPER"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if field is missing", () => {
    const invalidData = {
      input: { foo: "bar" },
      newField: "fooo",
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if newField is missing", () => {
    const invalidData = {
      field: "foo",
      input: { foo: "bar" },
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if input is missing", () => {
    const invalidData = {
      field: "foo",
      newField: "fooo",
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if input is not an object", () => {
    const invalidData = {
      field: "foo",
      input: "foo",
      newField: "fooo",
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
