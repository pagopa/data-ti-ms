import * as E from "fp-ts/Either";
import { mergeFields } from "../mergeFields";

const inputData = {
  bar: 1,
  baz: "hello",
  foo: "Foo"
};

describe("mergeFields", () => {
  it("should merge fields into a new field", () => {
    const res = mergeFields(["foo", "bar"], "mergedField", "-")(inputData);
    expect(res).toEqual(
      E.right({
        bar: 1,
        baz: "hello",
        foo: "Foo",
        mergedField: "Foo-1"
      })
    );
  });
  it("should output an empty string if no fields are provided", () => {
    const res = mergeFields([], "mergedField", "-")(inputData);
    expect(res).toEqual(
      E.right({
        bar: 1,
        baz: "hello",
        foo: "Foo",
        mergedField: ""
      })
    );
  });
  it("should output an empty string if a missing field is provided", () => {
    const res = mergeFields(
      ["bas" as keyof typeof inputData],
      "mergedField",
      "-"
    )(inputData);
    expect(res).toEqual(
      E.right({
        bar: 1,
        baz: "hello",
        foo: "Foo",
        mergedField: ""
      })
    );
  });
});
