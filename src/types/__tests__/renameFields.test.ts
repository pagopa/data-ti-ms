import * as E from "fp-ts/Either";
import { RenameFieldsMapping } from "../renameFields";

describe("renameFieldsMapping", () => {
  it("should validate the renameFieldsMapping", () => {
    const valiData = {
      input: { foo: "foo", bar: "bar" },
      mapper: "RENAME_FIELDS",
      renameChanges: [
        {
          e1: "foo",
          e2: "foo2"
        },
        {
          e1: "bar",
          e2: "bar2"
        }
      ]
    };
    const result = RenameFieldsMapping.decode(valiData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if renameChanges is missing", () => {
    const invalidData = {
      input: { foo: "foo", bar: "bar" },
      mapper: "RENAME_FIELDS"
    };
    const result = RenameFieldsMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if input is missing", () => {
    const invalidData = {
      renameChanges: [
        {
          e1: "foo",
          e2: "foo2"
        },
        {
          e1: "bar",
          e2: "bar2"
        }
      ],
      mapper: "RENAME_FIELDS"
    };
    const result = RenameFieldsMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if input is not an object", () => {
    const invalidData = {
      input: 2,
      renameChanges: [
        {
          e1: "foo",
          e2: "foo2"
        },
        {
          e1: "bar",
          e2: "bar2"
        }
      ],
      mapper: "RENAME_FIELDS"
    };
    const result = RenameFieldsMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if renameChanges is not an array of tuples2", () => {
    const invalidData = {
      input: { foo: "foo", bar: "bar" },
      renameChanges: [
        {
          e1: "foo"
        },
        {
          e1: "bar",
          e2: "bar2"
        }
      ],
      mapper: "RENAME_FIELDS"
    };
    const result = RenameFieldsMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
  it("should not validate if the value of the field e1 of a tuple2 is not a field of input", () => {
    const invalidData = {
      input: { foo: "foo", bar: "bar" },
      renameChanges: [
        {
          e1: "foooooo",
          e2: "foo2"
        },
        {
          e1: "bar",
          e2: "bar2"
        }
      ],
      mapper: "RENAME_FIELDS"
    };
    const result = RenameFieldsMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
