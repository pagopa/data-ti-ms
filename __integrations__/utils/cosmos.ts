import {
  Container,
  CosmosClient,
  Database,
  IndexingPolicy
} from "@azure/cosmos";
import * as RA from "fp-ts/ReadonlyArray";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { constVoid, pipe } from "fp-ts/lib/function";

export const COSMOS_COLLECTION_NAME = "integrationcollection";
export const COLLECTION_ID = Math.random().toString();
export const COLLECTION_PARTITION_KEY = "key";
export const COLLECTION_PARTITION_KEY_VALUE = "value";

export const COLLECTION_ID_KEY = Math.random().toString();
export const COLLECTION_ID_VERSION = Math.random().toString();

export const VERSION_FIELD_NAME = "version";
export const VERSION_FIELD_VALUE = "0";
export const WRONG_VERSION_FIELD_VALUE = "0";
/**
 * Create DB and collections
 */
export const createCosmosDbAndCollections = (
  client: CosmosClient,
  cosmosDbName: string
): TE.TaskEither<Error, Database> =>
  pipe(
    createDatabase(client, cosmosDbName),
    TE.chainFirst(createAllCollections)
  );

export const createDatabase = (
  client: CosmosClient,
  dbName: string
): TE.TaskEither<Error, Database> =>
  pipe(
    TE.tryCatch(
      () => client.databases.createIfNotExists({ id: dbName }),
      E.toError
    ),
    TE.map(databaseResponse => databaseResponse.database)
  );

export const deleteDatabase = (
  client: CosmosClient,
  dbName: string
): TE.TaskEither<Error, Database> =>
  pipe(
    TE.tryCatch(() => client.database(dbName).delete(), E.toError),
    TE.map(databaseResponse => databaseResponse.database)
  );

export const upsertItem = <T>(
  container: Container,
  item: T
): TE.TaskEither<Error, void> =>
  pipe(
    TE.tryCatch(() => container.items.upsert(item), E.toError),
    TE.map(constVoid)
  );
export const createAllCollections = (
  database: Database
): TE.TaskEither<Error, readonly Container[]> =>
  pipe(
    [
      pipe(
        createCollection(
          database,
          COSMOS_COLLECTION_NAME,
          COLLECTION_PARTITION_KEY
        ),
        TE.chainFirst(collection =>
          upsertItem(collection, {
            id: COLLECTION_ID_KEY,
            key: COLLECTION_PARTITION_KEY
          })
        ),
        TE.chainFirst(collection =>
          upsertItem(collection, {
            id: COLLECTION_ID_VERSION,
            key: COLLECTION_PARTITION_KEY_VALUE,
            version: VERSION_FIELD_VALUE
          })
        )
      )
    ],
    RA.sequence(TE.ApplicativePar)
  );

export const createCollection = (
  db: Database,
  containerName: string,
  partitionKey: string,
  indexingPolicy?: IndexingPolicy
): TE.TaskEither<Error, Container> =>
  pipe(
    TE.tryCatch(
      () =>
        db.containers.createIfNotExists({
          id: containerName,
          indexingPolicy,
          partitionKey: `/${partitionKey}`
        }),
      E.toError
    ),
    TE.map(containerResponse => containerResponse.container)
  );

export const deleteCollection = (
  db: Database,
  containerName: string
): TE.TaskEither<Error, Container> =>
  pipe(
    TE.tryCatch(() => db.container(containerName).delete(), E.toError),
    TE.map(containerResponse => containerResponse.container)
  );

export const deleteAllCollections = (
  database: Database
): TE.TaskEither<Error, readonly Container[]> =>
  pipe(
    database,
    TE.of,
    TE.bindTo("db"),
    TE.bind("collectionNames", ({ db }) =>
      pipe(
        TE.tryCatch(() => db.containers.readAll().fetchAll(), E.toError),
        TE.map(r => r.resources),
        TE.map(RA.map(r => r.id))
      )
    ),
    TE.chain(({ db, collectionNames }) =>
      pipe(
        collectionNames,
        RA.map(r => deleteCollection(db, r)),
        RA.sequence(TE.ApplicativePar)
      )
    )
  );
