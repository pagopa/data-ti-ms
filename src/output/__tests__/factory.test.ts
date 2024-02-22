import {
  DeduplicationStrategyType,
  getDeduplicationStrategy
} from "../factory";
import {
  indexerDeduplicationStrategy,
  tableStorageDeduplicationStrategy
} from "../service";

describe("getDeduplicationStrategy", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return indexer deduplication strategy", () => {
    const strategyType = DeduplicationStrategyType.Indexer;
    const strategy = getDeduplicationStrategy(strategyType);

    expect(strategy).toEqual(indexerDeduplicationStrategy);
  });

  it("should throw an error for unsupported strategy", () => {
    const unsupportedStrategy = "unsupportedStrategy" as DeduplicationStrategyType;

    expect(() => getDeduplicationStrategy(unsupportedStrategy)).toThrow(
      "Strategy not supported"
    );
  });

  it("should return tablestorage deduplication strategy", () => {
    const strategyType = DeduplicationStrategyType.TableStorage;
    const strategy = getDeduplicationStrategy(strategyType);

    expect(strategy).toEqual(tableStorageDeduplicationStrategy);
  });
});
