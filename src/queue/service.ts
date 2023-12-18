import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EachMessageHandler } from "kafkajs";
import {
  KafkaConsumerCompact,
  getEventHubConsumer,
  readMessage
} from "./eventhub/utils";

export type MessageHandler = EachMessageHandler;
export type QueueConsumer = KafkaConsumerCompact;
export interface IQueueService {
  readonly consumeMessage: (
    topic: string,
    messageHandler: MessageHandler
  ) => TE.TaskEither<Error, void>;
}

export const eventHubService = {
  consumeMessage: readMessage
};

export const createEventHubService = (
  connectionString: string
): E.Either<Error, IQueueService> =>
  pipe(
    getEventHubConsumer(connectionString),
    E.map(consumer => ({ consumeMessage: readMessage(consumer) }))
  );
