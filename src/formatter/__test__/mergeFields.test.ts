import * as E from "fp-ts/Either";
import { mergeFields } from "../mergeFields";

const inputData = {
  bar: 1,
  baz: "hello",
  foo: "Foo"
};

describe("mergeFields", () => {
  it("should merge fields into a new field", () => {
    const res = mergeFields(inputData, ["foo", "bar"], "mergedField", "-");
    expect(res).toEqual(
      E.right({ bar: 1, baz: "hello", foo: "Foo", mergedField: "Foo-1" })
    );
  });
});
