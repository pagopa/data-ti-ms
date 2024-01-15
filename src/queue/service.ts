import {
  KafkaConsumerCompact,
  RunnerConfig,
  defaultRunner,
  read
} from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EachMessageHandler } from "kafkajs";
import { getEventHubConsumer } from "./eventhub/utils";
export type MessageHandler = EachMessageHandler;
export type QueueConsumer = KafkaConsumerCompact;
export interface IQueueService {
  readonly consumeMessage: (
    topic: string,
    runnerConfig: RunnerConfig
  ) => TE.TaskEither<Error, void>;
}

const defaultConsumeMessage = (consumer: KafkaConsumerCompact) => (
  topic: string,
  runnerConfig: RunnerConfig
): TE.TaskEither<Error, void> =>
  read(consumer)({ topics: [topic] }, defaultRunner, runnerConfig);

export const eventHubService = {
  consumeMessage: read
};

export const createEventHubService = (
  connectionString: string
): E.Either<Error, IQueueService> =>
  pipe(
    getEventHubConsumer(connectionString),
    E.map(consumer => ({
      consumeMessage: defaultConsumeMessage(consumer)
    }))
  );
