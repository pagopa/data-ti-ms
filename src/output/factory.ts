import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";
import {
  IDeduplicationStrategy,
  indexerDeduplicationStrategy,
  tableStorageDeduplicationStrategy
} from "./service";

export enum DeduplicationStrategyType {
  Indexer = "indexer",
  TableStorage = "tableStorage"
}

export const IndexerDeduplicationStrategyConfig = t.type({
  type: t.literal(DeduplicationStrategyType.Indexer)
});

export const TableDeduplicationStrategyConfig = t.intersection([
  t.type({
    storageConnectionString: NonEmptyString,
    tableName: NonEmptyString,
    type: t.literal(DeduplicationStrategyType.TableStorage)
  }),
  t.partial({
    opts: t.type({
      allowInsecureConnection: t.boolean
    })
  })
]);
export type TableDeduplicationStrategyConfig = t.TypeOf<
  typeof TableDeduplicationStrategyConfig
>;

export const DeduplicationStrategyConfig = t.union([
  TableDeduplicationStrategyConfig,
  IndexerDeduplicationStrategyConfig
]);
export type DeduplicationStrategyConfig = t.TypeOf<
  typeof DeduplicationStrategyConfig
>;

export const getDeduplicationStrategy = (
  config: DeduplicationStrategyConfig
): IDeduplicationStrategy => {
  switch (config.type) {
    case DeduplicationStrategyType.Indexer:
      return indexerDeduplicationStrategy;
    case DeduplicationStrategyType.TableStorage:
      return tableStorageDeduplicationStrategy(config);
    default:
      throw new Error("Strategy not supported");
  }
};
