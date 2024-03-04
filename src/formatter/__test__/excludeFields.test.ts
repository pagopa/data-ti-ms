import { excludeFields } from "../excludeFields";

const inputData = {
  bar: "bar",
  baz: "hello",
  foo: "Foo"
};

describe("excludeFields", () => {
  it("should exclude fields from an object", () => {
    const res = excludeFields(inputData, ["foo", "baz"]);
    expect(res).toEqual({ bar: "bar" });
  });
  it("should return same input object if no fields are provided", () => {
    const res = excludeFields(inputData, []);
    expect(res).toEqual(inputData);
  });
  it("should return same input object if a missing field is provided", () => {
    const res = excludeFields(inputData, ["fooooo" as keyof typeof inputData]);
    expect(res).toEqual(inputData);
  });
});
