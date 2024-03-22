import { KafkaConsumerCompact } from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import { EachMessageHandler } from "kafkajs";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

const BaseQueueParams = t.type({
  connectionString: t.string
});
export type BaseQueueParams = t.TypeOf<typeof BaseQueueParams>;

export const RunnerConfigOptions = t.type({
  autoCommit: t.boolean,
  autoCommitInterval: t.number,
  autoCommitThreshold: t.number,
  eachBatchAutoResolve: t.boolean,
  partitionsConsumedConcurrently: t.number
});
export type RunnerConfigOptions = t.TypeOf<typeof RunnerConfigOptions>;

export const KafkaParams = t.intersection([
  BaseQueueParams,
  t.type({
    queueType: t.literal("BASIC_KAFKA"),
    runnerConfigOptions: RunnerConfigOptions,
    topicName: t.string
  })
]);
export type KafkaParams = t.TypeOf<typeof KafkaParams>;

export const NativeEvhParams = t.intersection([
  BaseQueueParams,
  t.type({
    queueType: t.literal("NATIVE_EVH")
  })
]);
export type NativeEvhParams = t.TypeOf<typeof NativeEvhParams>;

export const PasswordLessNativeEvhParams = t.type({
  hostName: t.string,
  queueType: t.literal("PASSWORDLESS_EVH"),
  topicName: t.string
});
export type PasswordLessNativeEvhParams = t.TypeOf<
  typeof PasswordLessNativeEvhParams
>;

export const QueueParams = t.union([
  KafkaParams,
  NativeEvhParams,
  PasswordLessNativeEvhParams
]);
export type QueueParams = t.TypeOf<typeof QueueParams>;

export type MessageHandler = EachMessageHandler;
export type QueueConsumer = KafkaConsumerCompact;

export interface IQueueService {
  readonly consumeMessage: TE.TaskEither<Error, void>;
}
