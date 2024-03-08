import * as E from "fp-ts/Either";
import { divideNumber, multiplyNumber, roundNumber } from "../number";

describe("multiplyNumber", () => {
  it("should return a number multiplied by a multiplier", () => {
    const num = multiplyNumber(2)(10);
    if (E.isRight(num)) {
      expect(num.right).toEqual(20);
    }
  });
});

describe("divideNumber", () => {
  it("should return a number divided by a divisor", () => {
    const num = divideNumber(2)(10);
    if (E.isRight(num)) {
      expect(num.right).toEqual(5);
    }
  });
  it("should return 0 when divided by 0", () => {
    const num = divideNumber(0)(10);
    if (E.isRight(num)) {
      expect(num.right).toEqual(0);
    }
  });
});

describe("roundNumber", () => {
  it("should return a number rounded to the specified decimals", () => {
    const num = roundNumber(2)(10.12345);
    if (E.isRight(num)) {
      expect(num.right).toEqual(10.12);
    }
  });
  it("should return the same number if decimals are negative", () => {
    const num = roundNumber(-2)(10.12345);
    if (E.isRight(num)) {
      expect(num.right).toEqual(10.12345);
    }
  });
});
