import {
  KafkaConsumerCompact,
  RunnerConfig,
  defaultRunner,
  read
} from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as AR from "fp-ts/Array";
import { constVoid, pipe } from "fp-ts/function";
import { EachMessageHandler } from "kafkajs";
import { earliestEventPosition } from "@azure/event-hubs";
import { EventHubConsumerClient } from "@azure/event-hubs";
import {
  getEventHubConsumer,
  getNativeEventHubConsumer,
  getPasswordLessNativeEventHubConsumer
} from "./eventhub/utils";

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

const getEvhSubscriber = (
  messageHandler: (
    message: Record<string, unknown>
  ) => TE.TaskEither<Error, void>
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => (consumer: EventHubConsumerClient) => (): TE.TaskEither<Error, void> =>
  pipe(
    consumer.subscribe(
      {
        processError: async (_err, _context) => {
          // error reporting/handling code here
        },
        processEvents: async (events, _) =>
          pipe(
            events,
            AR.map(msgEvt => messageHandler(msgEvt.body)),
            AR.sequence(TE.ApplicativeSeq),
            TE.mapLeft(err => {
              throw err;
            }),
            TE.map(constVoid),
            TE.toUnion
          )()
      },
      { maxBatchSize: 1, startPosition: earliestEventPosition }
    ),
    TE.of,
    TE.map(constVoid)
  );

export const createNativeEventHubService = (
  connectionString: string,
  messageHandler: (
    message: Record<string, unknown>
  ) => TE.TaskEither<Error, void>
): E.Either<Error, IQueueService> =>
  pipe(
    getNativeEventHubConsumer(connectionString),
    E.map(getEvhSubscriber(messageHandler)),
    E.map(consumeMessage => ({
      consumeMessage
    }))
  );

export const createPasswordlessNativeEventHubService = (
  hostName: string,
  topicName: string,
  messageHandler: (
    message: Record<string, unknown>
  ) => TE.TaskEither<Error, void>
): E.Either<Error, IQueueService> =>
  pipe(
    getPasswordLessNativeEventHubConsumer(hostName, topicName),
    E.map(getEvhSubscriber(messageHandler)),
    E.map(consumeMessage => ({
      consumeMessage
    }))
  );
