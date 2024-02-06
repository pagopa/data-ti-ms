import {
  DeduplicationStrategyType,
  getDeduplicationStrategy
} from "../factory";
import { timestampDeduplicationStrategy } from "../service";

describe("getDeduplicationStrategy", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return timestamp deduplication strategy", () => {
    const strategyType = DeduplicationStrategyType.Timestamp;
    const strategy = getDeduplicationStrategy(strategyType);

    expect(strategy).toEqual(timestampDeduplicationStrategy);
  });

  it("should throw an error for unsupported strategy", () => {
    const unsupportedStrategy = "unsupportedStrategy" as DeduplicationStrategyType;

    expect(() => getDeduplicationStrategy(unsupportedStrategy)).toThrow(
      "Strategy not supported"
    );
  });

  it("should throw an error for not implemented strategy", () => {
    const notImplementedStrategy = DeduplicationStrategyType.TableStorage;

    expect(() => getDeduplicationStrategy(notImplementedStrategy)).toThrow(
      "Strategy not already implemented"
    );
  });
});
