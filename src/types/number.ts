import * as t from "io-ts";

const MultiplyMapping = t.type({
  mapper: t.literal("MULTIPLY_NUMBER"),
  multiplier: t.number
});

type MultiplyMapping = t.TypeOf<typeof MultiplyMapping>;

const DivideMapping = t.type({
  divider: t.number,
  mapper: t.literal("DIVIDE_NUMBER")
});

type DivideMapping = t.TypeOf<typeof DivideMapping>;

const RoundMapping = t.type({
  decimals: t.number,
  mapper: t.literal("ROUND_NUMBER")
});

type RoundMapping = t.TypeOf<typeof RoundMapping>;

export const NumberMapping = t.union([
  DivideMapping,
  RoundMapping,
  MultiplyMapping
]);

export type NumberMapping = t.TypeOf<typeof NumberMapping>;
