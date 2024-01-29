import { selectFields } from "../selectFields";

const inputData = {
  bar: "bar",
  baz: "hello",
  foo: "Foo"
};

describe("selectFields", () => {
  it("should select fields from an object", () => {
    const res = selectFields(inputData, ["foo", "baz"]);
    expect(res).toEqual({ baz: "hello", foo: "Foo" });
  });
  it("should return an empty object if no fields are provided", () => {
    const res = selectFields(inputData, []);
    expect(res).toEqual({});
  });
  it("should return an empty object if a missing field is provided", () => {
    const res = selectFields(inputData, ["fooooo" as keyof typeof inputData]);
    expect(res).toEqual({});
  });
});
