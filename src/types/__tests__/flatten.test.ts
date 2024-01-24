import * as E from "fp-ts/Either";
import { FlattenMapping } from "../flatten";

describe("FlattenMapping", () => {
  it("should decode if config is a valid FlattenMapping", () => {
    const validData = {
      mapper: "FLATTEN"
    };
    const result = FlattenMapping.decode(validData);
    expect(E.isRight(result)).toBeTruthy();
  });
  it("should not validate if config is not a valid input", () => {
    const invalidData = {
      mapper: "INVALID_MAPPER"
    };
    const result = FlattenMapping.decode(invalidData);
    expect(E.isRight(result)).toBeFalsy();
  });
});
