import * as E from "fp-ts/Either";
import { switchCaseFormat } from "../case";

describe("switchCaseFormat", () => {
  const aFieldValue = "foo";
  const switchCaseMapping = { bar: "foo", foo: "bar" };
  const anotherSwitchCaseMapping = { 1: 2, 2: 1 };
  it("should return correct mapping if fieldValue matches a case", () => {
    const processor = switchCaseFormat(switchCaseMapping, "");
    expect(processor(aFieldValue)).toEqual(
      E.right(switchCaseMapping[aFieldValue])
    );
  });

  it("should return correct mapping with fieldValue type narrowing matching a case", () => {
    const processor = switchCaseFormat(anotherSwitchCaseMapping, 0);
    expect(processor(1)).toEqual(E.right(anotherSwitchCaseMapping[1]));
  });

  it("should return default mapping if fieldValue deos not match a case", () => {
    const processor = switchCaseFormat(switchCaseMapping, "");
    expect(processor(1)).toEqual(E.right(""));
  });
});
