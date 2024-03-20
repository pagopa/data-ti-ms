/* eslint-disable sort-keys */
import {
  KafkaConsumerCompact,
  getConsumerFromSas
} from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import { AzureEventhubSasFromString } from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaProducerCompact";
import { EventHubConsumerClient } from "@azure/event-hubs";
import { DefaultAzureCredential } from "@azure/identity";
import { defaultLog } from "@pagopa/winston-ts";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

export const getEventHubConsumer = (
  connectionString: string
): E.Either<Error, KafkaConsumerCompact> =>
  pipe(
    AzureEventhubSasFromString.decode(connectionString),
    E.bimap(
      errors =>
        pipe(
          defaultLog.either.error(
            `Error during decoding EventHub ConnectionURI - ${errors}`
          ),
          () => new Error(`Error during decoding Event Hub SAS`)
        ),
      getConsumerFromSas
    )
  );

export const getNativeEventHubConsumer = (
  connectionString: string,
  consumerGroup?: string
): E.Either<Error, EventHubConsumerClient> =>
  pipe(
    AzureEventhubSasFromString.decode(connectionString),
    E.map(() =>
      pipe(
        consumerGroup,
        O.fromNullable,
        O.getOrElse(() => "consumer-group"),
        groupId => new EventHubConsumerClient(groupId, connectionString)
      )
    ),
    E.mapLeft(() => new Error(`Error during decoding Event Hub SAS`))
  );

export const getPasswordLessNativeEventHubConsumer = (
  hostName: string,
  topicName: string,
  consumerGroup?: string
): E.Either<Error, EventHubConsumerClient> =>
  pipe(
    new DefaultAzureCredential(),
    credentials =>
      E.right(
        pipe(
          consumerGroup,
          O.fromNullable,
          O.getOrElse(() => "consumer-group"),
          groupId =>
            new EventHubConsumerClient(
              groupId,
              hostName,
              topicName,
              credentials
            )
        )
      ),
    E.mapLeft(() => new Error(`Error during decoding Event Hub SAS`))
  );
