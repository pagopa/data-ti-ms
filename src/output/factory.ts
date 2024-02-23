import {
  IDeduplicationStrategy,
  indexerDeduplicationStrategy,
  tableStorageDeduplicationStrategy
} from "./service";

export enum DeduplicationStrategyType {
  Indexer = "indexer",
  TableStorage = "tableStorage"
}

export const getDeduplicationStrategy = (
  type: DeduplicationStrategyType
): IDeduplicationStrategy => {
  switch (type) {
    case DeduplicationStrategyType.Indexer:
      return indexerDeduplicationStrategy;
    case DeduplicationStrategyType.TableStorage:
      return tableStorageDeduplicationStrategy;
    default:
      throw new Error("Strategy not supported");
  }
};
