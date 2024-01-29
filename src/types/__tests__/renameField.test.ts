import * as E from "fp-ts/Either";
import { RenameFieldMapping, RenameMapping } from "../renameField";

describe("RenameFieldMapping", () => {
  it("should decode if config is a valid RenameFieldMapping", () => {
    const validData = {
      newFieldName: "fooo",
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if config is not a valid input", () => {
    const invalidData = {
      newFieldName: "",
      mapper: "RENAME_FIELD"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if mapper is not 'RENAME_FIELD'", () => {
    const invalidData = {
      newFieldName: "fooo",
      mapper: "INVALID_MAPPER"
    };
    const result = RenameFieldMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});

describe("RenameMapping", () => {
  it("should decode if config is a valid RenameMapping instance of RenameFields mapper", () => {
    const validData = {
      mapper: "RENAME_FIELDS"
    };
    const result = RenameMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });

  it("should decode if config is a valid RenameMapping instance of RenameField mapper", () => {
    const validData = {
      newFieldName: "fooo",
      mapper: "RENAME_FIELD"
    };
    const result = RenameMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });

  it("should not validate if config is an invalid RenameMapping", () => {
    const invalidData = {
      mapper: "INVALID",
      otherProp: [] as any
    };
    const result = RenameMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
