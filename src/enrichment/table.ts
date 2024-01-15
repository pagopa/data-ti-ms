import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as DT from "@azure/data-tables";
import { getTableDocument } from "../utils/tableStorage";

export const tableEnrich = <T>(
  input: T,
  tableClient: DT.TableClient,
  partitionKeyField: keyof T,
  rowKeyField: keyof T
): TE.TaskEither<Error, T> =>
  pipe(
    getTableDocument(
      tableClient,
      String(input[partitionKeyField]),
      String(input[rowKeyField])
    ),
    TE.map(
      O.fold(
        () => input,
        tableDocument => ({ ...input, ...tableDocument })
      )
    )
  );
