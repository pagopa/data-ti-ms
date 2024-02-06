/* eslint-disable sonarjs/no-small-switch */
import {
  IDeduplicationStrategy,
  timestampDeduplicationStrategy
} from "./service";

export enum DeduplicationStrategyType {
  Timestamp = "timestamp",
  TableStorage = "tableStorage"
}

export const getDeduplicationStrategy = (
  type: DeduplicationStrategyType
): IDeduplicationStrategy => {
  switch (type) {
    case DeduplicationStrategyType.Timestamp:
      return timestampDeduplicationStrategy;
    case DeduplicationStrategyType.TableStorage:
      throw new Error("Strategy not already implemented");
    default:
      throw new Error("Strategy not supported");
  }
};
