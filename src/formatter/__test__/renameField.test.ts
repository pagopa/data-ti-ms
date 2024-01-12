import { Tuple2 } from "@pagopa/ts-commons/lib/tuples";
import { renameField, renameFields } from "../renameField";

const inputData = {
  bar: "bar",
  foo: "foo"
};

describe("renameField", () => {
  it("should rename a field", () => {
    const result = renameField(inputData, "bar", "bar2");
    expect(result).toEqual({ bar2: "bar", foo: "foo" });
  });

  it("should not rename a not existing field", () => {
    const result = renameField(
      inputData,
      "baz" as keyof typeof inputData,
      "bar2"
    );
    expect(result).toEqual(inputData);
  });
});

describe("renameFields", () => {
  it("should rename an array of fields", () => {
    const result = renameFields(inputData, [
      Tuple2("bar", "bar2"),
      Tuple2("foo", "baz")
    ]);
    expect(result).toEqual({ bar2: "bar", baz: "foo" });
  });
});
