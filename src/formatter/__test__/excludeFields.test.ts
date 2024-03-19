import * as E from "fp-ts/Either";
import { excludeFields } from "../excludeFields";

const inputData = {
  bar: "bar",
  baz: "hello",
  foo: "Foo"
};

describe("excludeFields", () => {
  it("should exclude fields from an object", () => {
    const res = excludeFields(["foo", "baz"])(inputData);
    expect(res).toEqual(E.right({ bar: "bar" }));
  });
  it("should return same input object if no fields are provided", () => {
    const res = excludeFields([])(inputData);
    expect(res).toEqual(E.right(inputData));
  });
  it("should return same input object if a missing field is provided", () => {
    const res = excludeFields(["fooooo" as keyof typeof inputData])(inputData);
    expect(res).toEqual(E.right(inputData));
  });
});
