import * as E from "fp-ts/lib/Either";
import { BooleanMapping } from "../boolean";

describe("BooleanToStringMapping", () => {
  it("should validate with correct values", () => {
    const validMapping = {
      falseString: "false",
      mapper: "BOOLEAN_TO_STRING",
      trueString: "true"
    };

    const result = BooleanMapping.decode(validMapping);

    expect(E.isRight(result)).toBeTruthy();
  });

  it("should not validate with incorrect values", () => {
    const invalidMapping = {
      falseString: 123,
      mapper: "BOOLEAN_TO_STRING",
      trueString: "true"
    };

    const result = BooleanMapping.decode(invalidMapping);

    expect(E.isRight(result)).toBeFalsy();
  });
});
