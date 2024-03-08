import * as E from "fp-ts/Either";
import { applySingleInput } from "../apply";
import { upperCaseFormat } from "../string";

const dataFlow = {
  foo: "bar"
};

describe("applySingleInput", () => {
  it("should apply a formatter function without adding new field", () => {
    const formattedFlow = applySingleInput("foo")(upperCaseFormat)(dataFlow);
    expect(formattedFlow).toEqual(E.right({ foo: dataFlow.foo.toUpperCase() }));
  });

  it("should apply a formatter function with adding new field", () => {
    const formattedFlow = applySingleInput("foo", "bar")(upperCaseFormat)(
      dataFlow
    );
    expect(formattedFlow).toEqual(
      E.right({
        bar: dataFlow.foo.toUpperCase(),
        foo: dataFlow.foo
      })
    );
  });
});
