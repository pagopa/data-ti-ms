import { renameField } from "../renameField";

const jsonString = '{"bar": 1, "foo": "foo"}';
const invalidJsonString = '{"bar" 1, "foo": "foo"}';

describe("renameField", () => {
  it("should rename a field", () => {
    const outputString = renameField<string | number>(jsonString, "bar", 2);
    expect(outputString).toEqual('{"bar":2,"foo":"foo"}');
  });
  it("should output a parsing error", () => {
    const outputString = renameField<string | number>(
      invalidJsonString,
      "bar",
      2
    );
    expect(outputString).toEqual(
      "Cannot parse JSON: Expected ':' after property name in JSON at position 7"
    );
  });
  it("should output a missing field error", () => {
    const outputString = renameField<string | number>(jsonString, "baz", 2);
    expect(outputString).toEqual('"Cannot find field: baz"');
  });
});
