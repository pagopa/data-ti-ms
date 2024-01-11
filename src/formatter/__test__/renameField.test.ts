import * as E from "fp-ts/Either";
import { renameField } from "../renameField";

const inputData = {
  bar: "bar",
  foo: "foo"
};

describe("renameField", () => {
  it("should rename a field", () => {
    const result = renameField(inputData, "bar", 2);
    expect(result).toEqual(E.right({ bar: 2, foo: "foo" }));
  });
});
