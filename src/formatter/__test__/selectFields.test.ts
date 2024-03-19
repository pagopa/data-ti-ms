import * as E from "fp-ts/Either";
import { selectFields } from "../selectFields";

const inputData = {
  bar: "bar",
  baz: "hello",
  foo: "Foo"
};

describe("selectFields", () => {
  it("should select fields from an object", () => {
    const res = selectFields(["foo", "baz"])(inputData);
    expect(res).toEqual(E.right({ baz: "hello", foo: "Foo" }));
  });
  it("should return an empty object if no fields are provided", () => {
    const res = selectFields([])(inputData);
    expect(res).toEqual(E.right({}));
  });
  it("should return an empty object if a missing field is provided", () => {
    const res = selectFields(["fooooo" as keyof typeof inputData])(inputData);
    expect(res).toEqual(E.right({}));
  });
});
