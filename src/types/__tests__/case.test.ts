import * as E from "fp-ts/lib/Either";
import { SwitchCaseMapping } from "../case";

describe("SwitchCaseMapping", () => {
  it("should validate the cases and defaultValue properties", () => {
    const validMapping = {
      cases: {
        case1: "value1",
        case2: "value2"
      },
      defaultValue: "default"
    };
    const result = SwitchCaseMapping.decode(validMapping);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not decode if cases is not an object", () => {
    const invalidMapping = {
      cases: "invalidCases",
      defaultValue: "default"
    };
    const result = SwitchCaseMapping.decode(invalidMapping);
    expect(E.isLeft(result)).toBeTruthy();
  });
});
