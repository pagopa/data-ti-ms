import { CosmosClient } from "@azure/cosmos";
import * as E from "fp-ts/Either";
import { createCosmosQueryEnrichmentService } from "../service";

jest.mock("@azure/cosmos", () => ({
  CosmosClient: jest.fn()
}));

describe("createCosmosQueryEnrichmentService", () => {
  it("should create CosmosQueryEnrichmentService successfully", () => {
    const connectionString = "your_connection_string";
    const result = createCosmosQueryEnrichmentService(connectionString);

    expect(E.isRight(result)).toBeTruthy();
    const enrichmentService = E.getOrElse(() => null)(result);

    expect(enrichmentService.findByKey).toBeInstanceOf(Function);
    expect(enrichmentService.findLastVersionByKey).toBeInstanceOf(Function);
  });

  it("should handle errors when creating CosmosClient", () => {
    const connectionString = "invalid_connection_string";
    (CosmosClient as jest.Mock).mockImplementationOnce(() => {
      {
        throw new Error("Connection error");
      }
    });
    const result = createCosmosQueryEnrichmentService(connectionString);

    expect(E.isLeft(result)).toBeTruthy();
    if (E.isLeft(result)) {
      expect(result.left).toEqual(new Error("Connection error"));
    }
  });
});
