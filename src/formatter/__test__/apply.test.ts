import { applyFormat } from "../apply";
import { upperCaseFormat } from "../string";

const dataFlow = {
  foo: "bar"
};

describe("applyFormat", () => {
  it("should apply a formatter function without adding new field", () => {
    const formattedFlow = applyFormat(dataFlow, "foo")(upperCaseFormat);
    expect(formattedFlow).toEqual({ foo: upperCaseFormat(dataFlow.foo) });
  });

  it("should apply a formatter function with adding new field", () => {
    const formattedFlow = applyFormat(dataFlow, "foo", "bar")(upperCaseFormat);
    expect(formattedFlow).toEqual({
      bar: upperCaseFormat(dataFlow.foo),
      foo: dataFlow.foo
    });
  });
});
