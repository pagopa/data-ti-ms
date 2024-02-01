import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

const DeduplicationStrategy = t.partial({
  deduplicationStrategy: t.literal("TIMESTAMP")
});

const DataOutputConfig = t.type({
  connectionString: NonEmptyString,
  indexName: NonEmptyString,
  type: t.literal("DATA_OUTPUT")
});

export const DataOutput = t.intersection([
  DataOutputConfig,
  DeduplicationStrategy
]);

export type DataOutput = t.TypeOf<typeof DataOutput>;
