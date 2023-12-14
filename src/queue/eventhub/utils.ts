/* eslint-disable sort-keys */
import {
  connect,
  disconnectWithoutError
} from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaOperation";
import {
  AzureEventhubSas,
  AzureEventhubSasFromString
} from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaProducerCompact";
import { defaultLog } from "@pagopa/winston-ts";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  Consumer,
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  EachBatchHandler,
  EachMessageHandler,
  Kafka,
  KafkaConfig
} from "kafkajs";

export interface IKafkaConsumerCompact {
  readonly consumer: Consumer;
}

export type KafkaConsumerCompact = IO.IO<IKafkaConsumerCompact>;

export type ValidableKafkaConsumerConfig = KafkaConfig & ConsumerConfig;

export const fromConfig = (
  config: ValidableKafkaConsumerConfig
): KafkaConsumerCompact => (): IKafkaConsumerCompact => ({
  consumer: new Kafka(config).consumer(config)
});

export const fromSas = (
  sas: AzureEventhubSas,
  groupId?: string
): KafkaConsumerCompact =>
  pipe(
    {
      brokers: [`${sas.url}:9093`],
      ssl: true,
      sasl: {
        mechanism: "plain" as const,
        username: "$ConnectionString",
        password: AzureEventhubSasFromString.encode(sas)
      },
      clientId: sas.policy,
      groupId: groupId || "consumer-group",
      topic: sas.name
    },
    fullConfig => fromConfig(fullConfig)
  );

export const getEventHubConsumer = (
  connectionString: string
): E.Either<Error, KafkaConsumerCompact> =>
  pipe(
    AzureEventhubSasFromString.decode(connectionString),
    E.map(sas => fromSas(sas)),
    E.mapLeft(errors =>
      pipe(
        defaultLog.either.error(
          `Error during decoding EventHub ConnectionURI - ${errors}`
        ),
        () => new Error(`Error during decoding Event Hub SAS`)
      )
    )
  );

export const subscribe = (subscription: ConsumerSubscribeTopics) => (
  client: Consumer
): TE.TaskEither<Error, void> =>
  TE.tryCatch(() => pipe(subscription, client.subscribe), E.toError);

export interface IConsumerRunOptions {
  readonly autoCommit?: boolean;
  readonly autoCommitInterval?: number | null;
  readonly autoCommitThreshold?: number | null;
  readonly eachBatchAutoResolve?: boolean;
  readonly partitionsConsumedConcurrently?: number;
}
export const getMessageConsumerRunConfig = (
  eachMessageHandler: EachMessageHandler,
  consumerRunOptions: IConsumerRunOptions
): ConsumerRunConfig =>
  ({
    autoCommit: consumerRunOptions.autoCommit,
    autoCommitInterval: consumerRunOptions.autoCommitInterval,
    autoCommitThreshold: consumerRunOptions.autoCommitThreshold,
    eachBatchAutoResolve: consumerRunOptions.eachBatchAutoResolve,
    partitionsConsumedConcurrently:
      consumerRunOptions.partitionsConsumedConcurrently,
    eachMessage: eachMessageHandler
  } as ConsumerRunConfig);

export const getBatchConsumerRunConfig = (
  eachBatchHandler: EachBatchHandler,
  consumerRunOptions: IConsumerRunOptions
): ConsumerRunConfig =>
  ({
    autoCommit: consumerRunOptions.autoCommit,
    autoCommitInterval: consumerRunOptions.autoCommitInterval,
    autoCommitThreshold: consumerRunOptions.autoCommitThreshold,
    eachBatchAutoResolve: consumerRunOptions.eachBatchAutoResolve,
    partitionsConsumedConcurrently:
      consumerRunOptions.partitionsConsumedConcurrently,
    eachBatch: eachBatchHandler
  } as ConsumerRunConfig);

export const run = (config: ConsumerRunConfig) => (
  client: Consumer
): TE.TaskEither<Error, void> =>
  TE.tryCatch(() => client.run(config), E.toError);

export const readMessage = (fa: KafkaConsumerCompact) => (
  topic: string,
  messageHandler: EachMessageHandler
): TE.TaskEither<Error, void> =>
  pipe(
    fa,
    TE.fromIO,
    TE.bindTo("client"),
    TE.mapLeft(E.toError),
    TE.chainFirstW(({ client }) =>
      pipe(
        client.consumer,
        connect,
        TE.chain(() => pipe(client.consumer, subscribe({ topics: [topic] })))
      )
    ),
    TE.chainFirstW(({ client }) =>
      pipe(getMessageConsumerRunConfig(messageHandler, {}), runConfig =>
        run(runConfig)(client.consumer)
      )
    ),
    TE.chain(({ client }) => disconnectWithoutError(client.consumer)),
    TE.map(() => void 0),
    TE.mapLeft(error => new Error(error))
  );
