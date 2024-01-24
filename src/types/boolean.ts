import * as t from "io-ts";

const BooleanToStringMapping = t.type({
  falseString: t.string,
  mapper: t.literal("BOOLEAN_TO_STRING"),
  trueString: t.string
});

type BooleanToStringMapping = t.TypeOf<typeof BooleanToStringMapping>;

export const BooleanMapping = BooleanToStringMapping;

export type BooleanMapping = t.TypeOf<typeof BooleanMapping>;
