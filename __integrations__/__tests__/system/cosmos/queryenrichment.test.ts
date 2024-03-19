import { CosmosClient } from "@azure/cosmos";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { constVoid, pipe } from "fp-ts/lib/function";
import { createCosmosQueryEnrichmentService } from "../../../../src/enrichment/query/cosmos/service";
import { COSMOSDB_CONNECTION_STRING, COSMOSDB_NAME } from "../../../env";
import {
  COLLECTION_ID_KEY,
  COLLECTION_ID_VERSION,
  COLLECTION_PARTITION_KEY,
  COLLECTION_PARTITION_KEY_VALUE,
  COSMOS_COLLECTION_NAME,
  VERSION_FIELD_NAME,
  VERSION_FIELD_VALUE,
  createCosmosDbAndCollections,
  deleteDatabase,
} from "../../../utils/cosmos";
import {
  IKeyQueryEnrichmentParams,
  IVersionedQueryEnrichmentParams,
} from "../../../../src/utils/types";

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
      throw Error(`Cannot delete db ${e}`);
    }),
  )();
});

const findByKeyParams: IKeyQueryEnrichmentParams<Record<string, unknown>> = {
  containerName: COSMOS_COLLECTION_NAME,
  databaseName: COSMOSDB_NAME,
  idFieldValue: COLLECTION_ID_KEY,
  partitionKeyFieldValue: COLLECTION_PARTITION_KEY,
};

describe("findByKey", () => {
  it("should return Some(unknown) when the item is found", async () => {
    await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) => service.findByKey(findByKeyParams)),
      TE.bimap(
        (err) => {
          new Error(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        O.fold(
          () => {
            throw new Error("it should be some");
          },
          (result) =>
            expect(result).toMatchObject({
              id: COLLECTION_ID_KEY,
              key: COLLECTION_PARTITION_KEY,
            }),
        ),
      ),
    )();
  });

  it("should return None when the item is not found - find by id and partition key", async () => {
    await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) => service.findByKey({...findByKeyParams, idFieldValue: Math.random().toString()})),
      TE.bimap(
        (err) => {
          new Error(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        (result) => expect(O.isNone(result)).toBeTruthy(),
      ),
    )();
  });
});

const findLastVersionParams: IVersionedQueryEnrichmentParams<
  Record<string, unknown>
> = {
  containerName: COSMOS_COLLECTION_NAME,
  databaseName: COSMOSDB_NAME,
  idFieldValue: COLLECTION_ID_VERSION,
  partitionKeyFieldName: COLLECTION_PARTITION_KEY,
  partitionKeyFieldValue: COLLECTION_PARTITION_KEY_VALUE,
  versionFieldName: VERSION_FIELD_NAME,
};

describe("findByLastVersionKey", () => {
  it("should return Some(unknown) when the item is found with the last version", async () => {
    return await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) =>
        service.findLastVersionByKey(findLastVersionParams),
      ),
      TE.bimap(
        (err) => {
          new Error(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        O.fold(
          () => {
            throw new Error("it should be some");
          },
          (result) => {
            expect(result).toMatchObject({
              id: COLLECTION_ID_VERSION,
              key: COLLECTION_PARTITION_KEY_VALUE,
              version: VERSION_FIELD_VALUE,
            });
          },
        ),
      ),
    )();
  });

  it("should return None(unknown) when the item is not found with last version", async () => {
    await pipe(
      createCosmosQueryEnrichmentService(COSMOSDB_CONNECTION_STRING),
      TE.fromEither,
      TE.chain((service) =>
        service.findLastVersionByKey({...findLastVersionParams, idFieldValue: Math.random().toString()}),
      ),
      TE.bimap(
        (err) => {
          new Error(
            `it should not fail while finding an existing document - ${err.message}`,
          );
        },
        (result) => expect(O.isNone(result)).toBeTruthy(),
      ),
    )();
  });
});
