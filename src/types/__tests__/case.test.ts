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
    expect(E.isRight(result)).toBe(true);
  });
});
