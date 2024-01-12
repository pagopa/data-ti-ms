/* eslint-disable sort-keys */
import {
  KafkaConsumerCompact,
  getConsumerFromSas
} from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import { AzureEventhubSasFromString } from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaProducerCompact";

import { defaultLog } from "@pagopa/winston-ts";
import * as E from "fp-ts/Either";
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
