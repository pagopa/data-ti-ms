import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import * as E from "fp-ts/Either";
import { flattenField } from "../flatten";

const aNormalizedField = {
  bar: 1,
  baz: false
};

const aNormalizedFieldWithAlreadyExistingProperty = {
  ...aNormalizedField,
  foo: "normalized_foo"
};

const input = {
  foo: "foo",
  normalized: aNormalizedField
};

const anotherInput = {
  ...input,
  normalized: aNormalizedFieldWithAlreadyExistingProperty
};
describe("flattenField", () => {
  it("should return unmodified input if fieldToFlat is not an Object", () => {
    const result = flattenField("foo")(input);
    expect(result).toEqual(E.right(input));
  });

  it("should return a flattened input without renaming any field", () => {
    const result = flattenField("normalized")(input);
    expect(result).toEqual(
      E.right(
        withoutUndefinedValues({
          ...input,
          normalized: undefined,
          ...aNormalizedField
        })
      )
    );
  });

  it("should return a flattened input with renaming fields that overlap existing input fields", () => {
    const result = flattenField("normalized")(anotherInput);
    expect(result).toEqual(
      E.right(
        withoutUndefinedValues({
          ...aNormalizedFieldWithAlreadyExistingProperty,
          ...anotherInput,
          normalized: undefined,
          normalized_foo: aNormalizedFieldWithAlreadyExistingProperty.foo
        })
      )
    );
  });
});
