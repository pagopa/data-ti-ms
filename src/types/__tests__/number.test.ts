import * as E from "fp-ts/lib/Either";
import { NumberMapping } from "../number";

describe("NumberMapping", () => {
  describe("DIVIDE_NUMBER", () => {
    it('should validate when divider is a number and mapper is "DIVIDE_NUMBER"', () => {
      const validData = {
        divider: 5,
        mapper: "DIVIDE_NUMBER"
      };

      const result = NumberMapping.decode(validData);

      expect(E.isRight(result)).toBe(true);
    });

    it("should not validate when divider is not a number", () => {
      const invalidData = {
        divider: "invalid",
        mapper: "DIVIDE_NUMBER"
      };

      const result = NumberMapping.decode(invalidData);

      expect(E.isRight(result)).toBe(false);
    });

    it('should not validate when mapper is not "DIVIDE_NUMBER"', () => {
      const invalidData = {
        divider: 5,
        mapper: "INVALID_MAPPER"
      };

      const result = NumberMapping.decode(invalidData);

      expect(E.isRight(result)).toBe(false);
    });

    it('should not validate when mapper is "DIVIDE_NUMBER" and decimals attribute is evaluated', () => {
      const invalidData = {
        decimals: 2,
        mapper: "DIVIDE_NUMBER"
      };

      const result = NumberMapping.decode(invalidData);

      expect(E.isRight(result)).toBe(false);
    });
  });

  describe("ROUND_NUMBER", () => {
    it('should validate when decimals is a number and mapper is "ROUND_NUMBER"', () => {
      const validData = {
        decimals: 5,
        mapper: "ROUND_NUMBER"
      };

      const result = NumberMapping.decode(validData);

      expect(E.isRight(result)).toBe(true);
    });

    it("should not validate when decimals is not a number", () => {
      const invalidData = {
        decimals: "5",
        mapper: "ROUND_NUMBER"
      };

      const result = NumberMapping.decode(invalidData);

      expect(E.isRight(result)).toBe(false);
    });

    it('should not validate when mapper is not "ROUND_NUMBER"', () => {
      const invalidData = {
        decimals: 5,
        mapper: "INVALID"
      };

      const result = NumberMapping.decode(invalidData);

      expect(E.isRight(result)).toBe(false);
    });

    it('should not validate when mapper is "ROUND_NUMBER" and divider attribute is evaluated', () => {
      const invalidData = {
        divider: 2,
        mapper: "ROUND_NUMBER"
      };

      const result = NumberMapping.decode(invalidData);

      expect(E.isRight(result)).toBe(false);
    });
  });
});
