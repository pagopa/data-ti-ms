import {
  IDeduplicationStrategy,
  indexerDeduplicationStrategy
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
      throw new Error("Strategy not already implemented");
    default:
      throw new Error("Strategy not supported");
  }
};
