import { CosmosClient } from "@azure/cosmos";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { constVoid, pipe } from "fp-ts/lib/function";
import { createCosmosQueryEnrichmentService } from "../../../../src/enrichment/query/cosmos/service";
import { COSMOSDB_CONNECTION_STRING, COSMOSDB_NAME } from "../../../env";
import {
  COLLECTION_ID,
  COLLECTION_ID_KEY,
  COLLECTION_ID_VERSION,
  COLLECTION_PARTITION_KEY,
  COSMOS_COLLECTION_NAME,
  VERSION_FIELD_NAME,
  VERSION_FIELD_VALUE,
  createCosmosDbAndCollections,
  deleteDatabase,
} from "../../../utils/cosmos";

const client = new CosmosClient(COSMOSDB_CONNECTION_STRING);

beforeAll(async () => {
  await pipe(
    createCosmosDbAndCollections(client, COSMOSDB_NAME),
    TE.getOrElse((e) => {
      throw Error(
        `Cannot initialize integration tests - ${JSON.stringify(e.message)}`,
      );
    }),
  )();
}, 60000);

afterAll(async () => {
  await pipe(
    deleteDatabase(client, COSMOSDB_NAME),
    TE.getOrElse((e) => {
      throw Error(`Cannot delete db ${e.message}`);
    }),
  )();
});
describe("findByKey", () => {
  it("should return Some(unknown) when the item is found - find only by id", async () => {
    await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) =>
        service.findByKey(COSMOSDB_NAME, COSMOS_COLLECTION_NAME, COLLECTION_ID),
      ),
      TE.bimap(
        (err) => {
          fail(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        O.fold(
          () => fail("it should be some"),
          (result) => expect(result).toMatchObject({ id: COLLECTION_ID }),
        ),
      ),
    )();
  });

  it("should return Some(unknown) when the item is found - find by id and partition key", async () => {
    await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) =>
        service.findByKey(
          COSMOSDB_NAME,
          COSMOS_COLLECTION_NAME,
          COLLECTION_ID_KEY,
          COLLECTION_PARTITION_KEY,
        ),
      ),
      TE.bimap(
        (err) => {
          fail(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        O.fold(
          () => fail("it should be some"),
          (result) =>
            expect(result).toMatchObject({
              id: COLLECTION_ID_KEY,
              key: COLLECTION_PARTITION_KEY,
            }),
        ),
      ),
    )();
  });

  it("should return None when the item is not found - find only by id", async () => {
    await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) =>
        service.findByKey(
          COSMOSDB_NAME,
          COSMOS_COLLECTION_NAME,
          COLLECTION_ID_KEY,
        ),
      ),
      TE.bimap(
        (err) => {
          fail(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        O.fold(
          () => constVoid(),
          () => fail("it should be none"),
        ),
      ),
    )();
  });

  it("should return None when the item is not found - find by id and partition key", async () => {
    await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) =>
        service.findByKey(
          COSMOSDB_NAME,
          COSMOS_COLLECTION_NAME,
          COLLECTION_ID,
          COLLECTION_PARTITION_KEY,
        ),
      ),
      TE.bimap(
        (err) => {
          fail(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        O.fold(
          () => constVoid(),
          () => fail("it should be none"),
        ),
      ),
    )();
  });
});

describe("findByLastVersionKey", () => {
  it("should return a not empty array when the item is found with the last version", async () => {
    return await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) =>
        service.findLastVersionByKey(
          COSMOSDB_NAME,
          COSMOS_COLLECTION_NAME,
          VERSION_FIELD_NAME,
          VERSION_FIELD_VALUE,
          COLLECTION_ID_VERSION,
          COLLECTION_PARTITION_KEY,
        ),
      ),
      TE.bimap(
        (err) => {
          fail(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        (result) =>
          expect(result).toMatchObject({
            id: COLLECTION_ID,
            key: COLLECTION_PARTITION_KEY,
            VERSION_FIELD_NAME: VERSION_FIELD_VALUE,
          }),
      ),
    )();
  });

  it("should return an empty array when the item is not found", async () => {
    await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) =>
        service.findLastVersionByKey(
          COSMOSDB_NAME,
          COSMOS_COLLECTION_NAME,
          VERSION_FIELD_NAME,
          VERSION_FIELD_VALUE,
          COLLECTION_ID_KEY,
          COLLECTION_PARTITION_KEY,
        ),
      ),
      TE.bimap(
        (err) => {
          fail(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        (result) => expect(result).toHaveLength(0),
      ),
    )();
  });
});
