import { CosmosClient } from "@azure/cosmos";
import { KafkaConsumerCompact } from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EachMessageHandler } from "kafkajs";
import { findByKey, findLastVersionByKey } from "./utils";
export type MessageHandler = EachMessageHandler;
export type QueueConsumer = KafkaConsumerCompact;

export type QueryClient = CosmosClient;

export interface IQueueEnrichment {
  readonly findByKey: (
    client: QueryClient
  ) => (
    database: string,
    containerName: string,
    id: string,
    partitionKey?: string
  ) => TE.TaskEither<Error, void>;

  readonly findLastVersionByKey: (
    client: QueryClient
  ) => (
    database: string,
    containerName: string,
    versionFieldName: string,
    versionFieldValue: string,
    id: string,
    partitionKeyField: string,
    partitionKeyValue: string
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
