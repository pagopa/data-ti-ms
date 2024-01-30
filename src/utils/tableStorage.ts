import * as DT from "@azure/data-tables";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

export const TableStorageDocument = t.type({
  partitionKey: t.string,
  rowKey: t.string
});
export type TableStorageDocument = t.TypeOf<typeof TableStorageDocument>;

export const getTableClient = (
  connectionString: string,
  tableName: string,
  opts?: DT.TableServiceClientOptions
): DT.TableClient =>
  DT.TableClient.fromConnectionString(connectionString, tableName, opts);

export const getTableDocument = <T extends Record<string, unknown>>(
  tableClient: DT.TableClient,
  partitionKey: string,
  rowKey: string
): TE.TaskEither<Error, O.Option<T>> =>
  pipe(
    TE.tryCatch(
      () => tableClient.getEntity(partitionKey, rowKey),
      e => e as DT.RestError
    ),
    TE.map(O.some),
    TE.orElse(restError =>
      pipe(
        restError.statusCode,
        TE.fromPredicate(statusCode => statusCode === 404, E.toError),
        TE.map(() => O.none)
      )
    )
  );
