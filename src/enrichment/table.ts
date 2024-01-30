import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as DT from "@azure/data-tables";
import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";
import { flattenField } from "../formatter/flatten";
import { getTableDocument } from "../utils/tableStorage";
import { NotInKeys } from "../utils/types";

export const InputKeyFields = t.type({
  partitionKey: NonEmptyString,
  rowKey: NonEmptyString
});

export type InputKeyFields = t.TypeOf<typeof InputKeyFields>;

export const tableEnrich = <T, K extends string>(
  input: T,
  tableClient: DT.TableClient,
  partitionKeyField: keyof T,
  rowKeyField: keyof T,
  outputFieldName?: NotInKeys<T, K>
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
      flow(
        O.map(tableDocument =>
          pipe(
            outputFieldName,
            O.fromNullable,
            O.map(fieldName => ({ ...input, [fieldName]: tableDocument })),
            O.getOrElse(() =>
              pipe(
                `${String(partitionKeyField)}_${String(rowKeyField)}_enrich`,
                flattenFieldName =>
                  flattenField(
                    {
                      ...input,
                      [flattenFieldName]: tableDocument
                    },
                    flattenFieldName
                  )
              )
            )
          )
        ),
        O.getOrElse(() => input)
      )
    )
  );
