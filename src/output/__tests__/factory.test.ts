import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import {
  DeduplicationStrategyType,
  getDeduplicationStrategy
} from "../factory";
import {
  indexerDeduplicationStrategy, tableStorageDeduplicationStrategy
} from "../service";

describe("getDeduplicationStrategy", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return indexer deduplication strategy", () => {
    const strategyType = { type: DeduplicationStrategyType.Indexer } as any;
    const strategy = getDeduplicationStrategy(strategyType);

    expect(strategy).toEqual(indexerDeduplicationStrategy);
  });

  it("should throw an error for unsupported strategy", () => {
    const unsupportedStrategy = "unsupportedStrategy" as any;

    expect(() => getDeduplicationStrategy(unsupportedStrategy)).toThrow(
      "Strategy not supported"
    );
  });

  it("should return tablestorage deduplication strategy", () => {
    const strategyType = DeduplicationStrategyType.TableStorage;
    const strategy = getDeduplicationStrategy({
      type: strategyType,
      storageConnectionString: "foo" as NonEmptyString
    });
    expect(strategy).toBeDefined();
  });
});
