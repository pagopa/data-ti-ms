import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as DT from "@azure/data-tables";
import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";
import { getTableDocument } from "../utils/tableStorage";

export const InputKeyFields = t.type({
  partitionKey: NonEmptyString,
  rowKey: NonEmptyString
});

export type InputKeyFields = t.TypeOf<typeof InputKeyFields>;

export const tableEnrich = <T>(
  input: T,
  tableClient: DT.TableClient,
  partitionKeyField: keyof T,
  rowKeyField: keyof T
): TE.TaskEither<Error, T> =>
  pipe(
    { partitionKey: input[partitionKeyField], rowKey: input[rowKeyField] },
    InputKeyFields.decode,
    E.mapLeft(errs =>
      Error(
        `Given key fields from input stream are not valid|Error=${errorsToReadableMessages(
          errs
        )}`
      )
    ),
    TE.fromEither,
    TE.chain(inputKeys =>
      getTableDocument(tableClient, inputKeys.partitionKey, inputKeys.rowKey)
    ),
    TE.map(
      O.fold(
        () => input,
        tableDocument => ({ ...input, ...tableDocument })
      )
    )
  );
