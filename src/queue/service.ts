import {
  KafkaConsumerCompact,
  ReadType,
  RunnerConfig,
  defaultRunner,
  read
} from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as AR from "fp-ts/Array";
import * as J from "fp-ts/Json";
import { constVoid, flow, pipe } from "fp-ts/function";
import { earliestEventPosition } from "@azure/event-hubs";
import { EventHubConsumerClient } from "@azure/event-hubs";
import { toJsonObject } from "../utils/data";
import {
  IQueueService,
  KafkaParams,
  NativeEvhParams,
  PasswordLessNativeEvhParams
} from "../types/evh";
import {
  getEventHubConsumer,
  getNativeEventHubConsumer,
  getPasswordLessNativeEventHubConsumer
} from "./eventhub/utils";

const defaultConsumeMessage = (consumer: KafkaConsumerCompact) => (
  topic: string,
  runnerConfig: RunnerConfig
): TE.TaskEither<Error, void> =>
  read(consumer)({ topics: [topic] }, defaultRunner, runnerConfig);

export const createEventHubService = (params: KafkaParams) => (
  messageHandler: (
    message: Record<string, unknown>
  ) => TE.TaskEither<Error, void>
): E.Either<Error, IQueueService> =>
  pipe(
    getEventHubConsumer(params.connectionString),
    E.map(consumer => ({
      consumeMessage: defaultConsumeMessage(consumer)(params.topicName, {
        ...params.runnerConfigOptions,
        handler: eachBatchPayload =>
          pipe(
            eachBatchPayload.batch.messages,
            AR.map(
              flow(
                msg => msg.value,
                buf => buf.toString(),
                J.parse,
                E.mapLeft(err =>
                  Error(`Cannot decode Kafka Message|ERROR=${String(err)}`)
                ),
                E.map(toJsonObject),
                TE.fromEither,
                TE.chain(messageHandler)
              )
            ),
            AR.sequence(TE.ApplicativeSeq),
            TE.mapLeft(err => {
              throw err;
            }),
            TE.map(constVoid),
            TE.toUnion
          )(),
        readType: ReadType.Message
      })
    }))
  );

const getEvhSubscriber = (
  messageHandler: (
    message: Record<string, unknown>
  ) => TE.TaskEither<Error, void>
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => (consumer: EventHubConsumerClient): TE.TaskEither<Error, void> =>
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

export const createNativeEventHubService = (params: NativeEvhParams) => (
  messageHandler: (
    message: Record<string, unknown>
  ) => TE.TaskEither<Error, void>
): E.Either<Error, IQueueService> =>
  pipe(
    getNativeEventHubConsumer(params.connectionString),
    E.map(getEvhSubscriber(messageHandler)),
    E.map(consumeMessage => ({
      consumeMessage
    }))
  );

export const createPasswordlessNativeEventHubService = (
  params: PasswordLessNativeEvhParams
) => (
  messageHandler: (
    message: Record<string, unknown>
  ) => TE.TaskEither<Error, void>
): E.Either<Error, IQueueService> =>
  pipe(
    getPasswordLessNativeEventHubConsumer(params.hostName, params.topicName),
    E.map(getEvhSubscriber(messageHandler)),
    E.map(consumeMessage => ({
      consumeMessage
    }))
  );
