import * as E from "fp-ts/lib/Either";
import { filterDynamic, filterStatic } from "../filter";

const inputData = {
  bar: "bar",
  baz: "hello",
  foo: "Foo",
  qux: 3
};

describe("filter", () => {
  describe("filterStatic", () => {
    it("should return true for staticCompare", () => {
      const res = filterStatic("bar", "eq", "bar")(inputData);
      expect(res).toEqual(E.right(true));
    });
    it("should return left for staticCompare on unavailable field", () => {
      const res = filterStatic("undef", "eq", "bar")(inputData);
      expect(E.isLeft(res)).toBeTruthy();
    });
    it("should return left for staticCompare on wrong Filter Definition (isNull)", () => {
      const res = filterStatic("bar", "isNull", "bar")(inputData);
      expect(E.isLeft(res)).toBeTruthy();
    });
    it("should return left for staticCompare on wrong Filter Definition ('gt' condition with non-numeral value)", () => {
      const res = filterStatic("bar", "gt", "bar")(inputData);
      expect(E.isLeft(res)).toBeTruthy();
    });
    it("should return E.right(true) for staticCompare on numeral check", () => {
      const res = filterStatic("qux", "gt", 1)(inputData);
      expect(res).toEqual(E.right(true));
    });
    it("should return E.right(false) for staticCompare on numeral check on string value", () => {
      const res = filterStatic("bar", "gt", 1)(inputData);
      expect(res).toEqual(E.right(false));
    });
    it("should return left for staticCompare on wrong Filter Definition (eq with no staticValue)", () => {
      const res = filterStatic("bar", "eq")(inputData);
      expect(E.isLeft(res)).toBeTruthy();
    });
  });
  describe("filterDynamic", () => {
    it("should return true for dynamicCompare", () => {
      const res = filterDynamic("bar", "eq", "foo")(inputData);
      expect(res).toEqual(E.right(false));
    });
    it("should return left for dynamicCompare on unavailable fields", () => {
      const res = filterDynamic("undef", "eq", "bar")(inputData);
      expect(E.isLeft(res)).toBeTruthy();
    });
    it("should return left for dynamicCompare on unavailable fields", () => {
      const res = filterDynamic("bar", "eq", "undef")(inputData);
      expect(E.isLeft(res)).toBeTruthy();
    });
    it("should return E.right(false) for dynamicCompare on identity compare for 'gt' compare", () => {
      const res = filterDynamic("bar", "gt", "bar")(inputData);
      expect(res).toEqual(E.right(false));
    });
    it("should return E.right(false) for dynamicCompare on comparing different types", () => {
      const res = filterDynamic("qux", "gt", "bar")(inputData);
      expect(res).toEqual(E.right(false));
    });
    it("should return E.right(false) for dynamicCompare on numeral check on string value", () => {
      const res = filterDynamic("bar", "gt", "baz")(inputData);
      expect(res).toEqual(E.right(false));
    });
  });
});
