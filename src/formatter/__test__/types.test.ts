import * as E from "fp-ts/lib/Either";
import { SingleInputMappingFormatter } from "../types";
const INPUT_FIELD_NAME = "inputField";
const OUTPUT_FIELD_NAME = "outputField";

describe("SingleInputMappingFormatter", () => {
  it("should create a formatter with input and output fields", () => {
    const formatter = SingleInputMappingFormatter("inputField", "outputField");
    const input = { [INPUT_FIELD_NAME]: "foo" };
    const output = { ...input, [OUTPUT_FIELD_NAME]: input[INPUT_FIELD_NAME] };
    const result = formatter.decode(output);
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(output);
    }
  });

  it("should create a formatter with input field only", () => {
    const formatter = SingleInputMappingFormatter("inputField");
    const input = { inputField: "inputValue" };
    const output = { ...input };
    const result = formatter.decode(output);
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(output);
    }
  });
});
