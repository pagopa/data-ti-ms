import { CosmosClient } from "@azure/cosmos";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { findByKey, findLastVersionByKey } from "./utils";

export type QueryClient = CosmosClient;

export interface IQueueEnrichment {
  readonly findByKey: (
    database: string,
    containerName: string,
    id: string,
    partitionKey?: string
  ) => TE.TaskEither<Error, O.Option<unknown>>;

  readonly findLastVersionByKey: (
    database: string,
    containerName: string,
    versionFieldName: string,
    versionFieldValue: string,
    id: string,
    partitionKey: string
  ) => TE.TaskEither<Error, ReadonlyArray<unknown>>;
}

export const createCosmosQueryEnrichmentService = (
  connectionString: string
): E.Either<Error, IQueueEnrichment> =>
  pipe(
    E.tryCatch(() => new CosmosClient(connectionString), E.toError),
    E.map(
      client =>
        (({
          findByKey: findByKey(client),
          findLastVersionByKey: findLastVersionByKey(client)
        } as unknown) as IQueueEnrichment)
    )
  );
