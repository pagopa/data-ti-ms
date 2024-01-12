import { mergeFields } from "../mergeFields";

const inputData = {
  bar: 1,
  baz: "hello",
  foo: "Foo"
};

describe("mergeFields", () => {
  it("should merge fields into a new field", () => {
    const res = mergeFields(inputData, ["foo", "bar"], "mergedField", "-");
    expect(res).toEqual({
      bar: 1,
      baz: "hello",
      foo: "Foo",
      mergedField: "Foo-1"
    });
  });
  it("should output an empty string if no fields are provided", () => {
    const res = mergeFields(inputData, [], "mergedField", "-");
    expect(res).toEqual({
      bar: 1,
      baz: "hello",
      foo: "Foo",
      mergedField: ""
    });
  });
  it("should output an empty string if a missing field is provided", () => {
    const res = mergeFields(
      inputData,
      ["bas" as keyof typeof inputData],
      "mergedField",
      "-"
    );
    expect(res).toEqual({
      bar: 1,
      baz: "hello",
      foo: "Foo",
      mergedField: ""
    });
  });
});
