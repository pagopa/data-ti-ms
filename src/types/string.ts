import * as t from "io-ts";

const UpperCaseMapping = t.type({
  mapper: t.literal("UPPER_CASE")
});

type UpperCaseMapping = t.TypeOf<typeof UpperCaseMapping>;

const LowerCaseMapping = t.type({
  mapper: t.literal("LOWER_CASE")
});

type LowerCaseMapping = t.TypeOf<typeof LowerCaseMapping>;

const CapitalizeMapping = t.type({
  mapper: t.literal("CAPITALIZE")
});

type CapitalizeMapping = t.TypeOf<typeof CapitalizeMapping>;

const TrimMapping = t.type({
  mapper: t.literal("TRIM")
});

type TrimMapping = t.TypeOf<typeof TrimMapping>;

const ReplaceMapping = t.type({
  mapper: t.literal("REPLACE"),
  placeholder: t.string,
  toBeReplaced: t.string
});

type ReplaceMapping = t.TypeOf<typeof ReplaceMapping>;

const ReplaceAllMapping = t.type({
  mapper: t.literal("REPLACE_ALL"),
  placeholder: t.string,
  toBeReplaced: t.string
});

type ReplaceAllMapping = t.TypeOf<typeof ReplaceAllMapping>;

export const StringMapping = t.union([
  UpperCaseMapping,
  LowerCaseMapping,
  CapitalizeMapping,
  ReplaceMapping,
  ReplaceAllMapping,
  TrimMapping
]);

export type StringMapping = t.TypeOf<typeof StringMapping>;
