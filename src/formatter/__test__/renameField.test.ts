import { Tuple2 } from "@pagopa/ts-commons/lib/tuples";
import * as E from "fp-ts/Either";
import { renameField, renameFields } from "../renameField";

const inputData = {
  bar: "bar",
  foo: "foo"
};

describe("renameField", () => {
  it("should rename a field", () => {
    const result = renameField("bar", "bar2")(inputData);
    expect(result).toEqual(E.right({ bar2: "bar", foo: "foo" }));
  });

  it("should not rename a not existing field", () => {
    const result = renameField(
      "baz" as keyof typeof inputData,
      "bar2"
    )(inputData);
    expect(result).toEqual(E.right(inputData));
  });
});

describe("renameFields", () => {
  it("should rename an array of fields", () => {
    const result = renameFields([Tuple2("bar", "bar2"), Tuple2("foo", "baz")])(
      inputData
    );
    expect(result).toEqual(E.right({ bar2: "bar", baz: "foo" }));
  });
});
