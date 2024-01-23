import * as E from "fp-ts/Either";
import { StringMapping } from "../string";

const upperCaseMapping = {
  inputFieldName: "foo",
  mapper: "UPPER_CASE"
};

const lowerCaseMapping = {
  inputFieldName: "foo",
  mapper: "LOWER_CASE"
};

const capitalizeMapping = {
  inputFieldName: "foo",
  mapper: "CAPITALIZE"
};

const trimMapping = {
  inputFieldName: "foo",
  mapper: "TRIM"
};

const replaceMapping = {
  inputFieldName: "foo",
  mapper: "REPLACE",
  placeholder: "a",
  toBeReplaced: "b"
};

const replaceAllMapping = {
  inputFieldName: "foo",
  mapper: "REPLACE",
  placeholder: "a",
  toBeReplaced: "b"
};

const invalidMapping = {
  inputFieldName: "foo",
  mapper: "INVALID"
};

describe("StringMapping", () => {
  it.each`
    description                                                  | input                | success
    ${"should decode a correct UpperCaseMapping type properly"}  | ${upperCaseMapping}  | ${true}
    ${"should decode a correct LowerCaseMapping type properly"}  | ${lowerCaseMapping}  | ${true}
    ${"should decode a correct CapitalizeMapping type properly"} | ${capitalizeMapping} | ${true}
    ${"should decode a correct TrimMapping type properly"}       | ${trimMapping}       | ${true}
    ${"should decode a correct ReplaceMapping type properly"}    | ${replaceMapping}    | ${true}
    ${"should decode a correct ReplaceAllMapping type properly"} | ${replaceAllMapping} | ${true}
    ${"should NOT decode an invalid type properly"}              | ${invalidMapping}    | ${false}
  `("$description", ({ input, success }) => {
    const res = StringMapping.decode(input);
    expect(E.isRight(res)).toEqual(success);
  });
});
