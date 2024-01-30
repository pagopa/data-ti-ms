import * as t from "io-ts";

export const FlattenMapping = t.type({
  mapper: t.literal("FLATTEN")
});

type FlattenMapping = t.TypeOf<typeof FlattenMapping>;
