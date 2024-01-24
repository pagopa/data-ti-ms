import * as E from "fp-ts/Either";
import { SingleInputMapping } from "../singleInput";

const numberCaseMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  divider: 10,
  mapper: "DIVIDE_NUMBER",
  outputFieldName: "bar"
};

const invalidNumberCaseMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  divider: "invalid",
  mapper: "DIVIDE_NUMBER",
  outputFieldName: "bar"
};

const anotherInvalidNumberCaseMapping = {
  type: "SINGLE_INPUT",
  divider: 10,
  mapper: "DIVIDE_NUMBER",
  outputFieldName: "bar"
};

const stringCaseMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "UPPER_CASE",
  outputFieldName: "bar"
};

const invalidStringCaseMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "INVALID",
  outputFieldName: "bar"
};

const booleanCaseMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "BOOLEAN_TO_STRING",
  trueString: "true",
  falseString: "false"
};

const invalidBooleanCaseMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "INVALID",
  trueString: "true",
  falseString: "false"
};

const switchCaseMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "SWITCH_CASE",
  cases: {
    true: "true",
    false: "false"
  },
  defaultCase: "default"
};

const invalidSwitchCaseMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "SWITCH_CASE",
  cases: "invalid cases"
};

const renameFieldMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "RENAME_FIELD",
  newFieldName: "bar"
};

const invalidRenameFieldMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "INVALID",
  newFieldName: "bar"
};

const dateMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "DATE_TO_ISO"
};

const convertFormatMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "CONVERT_FORMAT",
  output: "yyyy-MM-dd"
};

const invalidConvertFormatMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "CONVERT_FORMAT",
  output: "invalid output string"
};

const flattenMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "FLATTEN"
};

const invalidFlattenMapping = {
  type: "SINGLE_INPUT",
  inputFieldName: "foo",
  mapper: "INVALID"
};

describe("SingleInputMapping", () => {
  it("should decode a correct numberCaseMapping type properly", () => {
    const res = SingleInputMapping.decode(numberCaseMapping);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct stringCaseMapping type properly", () => {
    const res = SingleInputMapping.decode(stringCaseMapping);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct booleanCaseMapping type properly", () => {
    const res = SingleInputMapping.decode(booleanCaseMapping);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct switchCaseMapping type properly", () => {
    const res = SingleInputMapping.decode(switchCaseMapping);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct renameFieldMapping type properly", () => {
    const res = SingleInputMapping.decode(renameFieldMapping);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should not decode an invalid numberCaseMapping properly", () => {
    const res = SingleInputMapping.decode(invalidNumberCaseMapping);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should not decode another invalid numberCaseMapping properly", () => {
    const res = SingleInputMapping.decode(anotherInvalidNumberCaseMapping);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should not decode an invalid stringCaseMapping type properly", () => {
    const res = SingleInputMapping.decode(invalidStringCaseMapping);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should not decode an invalid booleanCaseMapping type properly", () => {
    const res = SingleInputMapping.decode(invalidBooleanCaseMapping);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should not decode an invalid switchCaseMapping type properly", () => {
    const res = SingleInputMapping.decode(invalidSwitchCaseMapping);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should not decode an invalid renameFieldMapping type properly", () => {
    const res = SingleInputMapping.decode(invalidRenameFieldMapping);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should decode a correct dateMapping type properly", () => {
    const res = SingleInputMapping.decode(dateMapping);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should decode a correct convertFormatMapping type properly", () => {
    const res = SingleInputMapping.decode(convertFormatMapping);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should not decode an invalid convertFormatMapping type properly", () => {
    const res = SingleInputMapping.decode(invalidConvertFormatMapping);
    expect(E.isLeft(res)).toBeTruthy();
  });
  it("should decode a correct flattenMapping type properly", () => {
    const res = SingleInputMapping.decode(flattenMapping);
    expect(E.isRight(res)).toBeTruthy();
  });
  it("should not decode an invalid flattenMapping type properly", () => {
    const res = SingleInputMapping.decode(invalidFlattenMapping);
    expect(E.isLeft(res)).toBeTruthy();
  });
});
