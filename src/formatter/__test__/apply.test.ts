import { applySingleInput } from "../apply";
import { upperCaseFormat } from "../string";

const dataFlow = {
  foo: "bar"
};

describe("applySingleInput", () => {
  it("should apply a formatter function without adding new field", () => {
    const formattedFlow = applySingleInput("foo")(upperCaseFormat)(dataFlow);
    expect(formattedFlow).toEqual({ foo: upperCaseFormat(dataFlow.foo) });
  });

  it("should apply a formatter function with adding new field", () => {
    const formattedFlow = applySingleInput("foo", "bar")(upperCaseFormat)(
      dataFlow
    );
    expect(formattedFlow).toEqual({
      bar: upperCaseFormat(dataFlow.foo),
      foo: dataFlow.foo
    });
  });
});
