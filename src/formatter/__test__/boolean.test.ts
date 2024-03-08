import * as E from "fp-ts/Either";
import { booleanToString } from "../boolean";
describe("booleanToString", () => {
  const trueString = "YES";
  const falseString = "NO";
  it("should return trueString if boolean value is true", () => {
    const processor = booleanToString(trueString, falseString);
    expect(processor(true)).toEqual(E.right(trueString));
  });

  it("should return falseString if boolean value is false", () => {
    const processor = booleanToString(trueString, falseString);
    expect(processor(false)).toEqual(E.right(falseString));
  });
});
