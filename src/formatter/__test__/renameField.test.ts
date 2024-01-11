import { renameField } from "../renameField";

const inputData = {
  bar: "bar",
  foo: "foo"
};

describe("renameField", () => {
  it("should rename a field", () => {
    const result = renameField(inputData, "bar", "bar2");
    expect(result).toEqual({ bar2: "bar", foo: "foo" });
  });
});
