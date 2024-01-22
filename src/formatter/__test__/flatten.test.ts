import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
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
    const result = flattenField(input, "foo");
    expect(result).toEqual(input);
  });

  it("should return a flattened input without renaming any field", () => {
    const result = flattenField(input, "normalized");
    expect(result).toEqual(
      withoutUndefinedValues({
        ...input,
        normalized: undefined,
        ...aNormalizedField
      })
    );
  });

  it("should return a flattened input with renaming fields that overlap existing input fields", () => {
    const result = flattenField(anotherInput, "normalized");
    expect(result).toEqual(
      withoutUndefinedValues({
        ...aNormalizedFieldWithAlreadyExistingProperty,
        ...anotherInput,
        normalized: undefined,
        normalized_foo: aNormalizedFieldWithAlreadyExistingProperty.foo
      })
    );
  });
});
