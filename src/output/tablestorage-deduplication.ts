/* eslint-disable sort-keys */
import { defaultLog } from "@pagopa/winston-ts";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { constVoid, flow, pipe } from "fp-ts/lib/function";
import {
  getTableClient,
  getTableDocument,
  upsertTableDocument
} from "../utils/tableStorage";
import { IOutputDocument } from "./elasticsearch/elasticsearch";
import { IOutputDeduplicationService } from "./elasticsearch/service";
export const tableStorageDeduplication = (
  indexName: string,
  document: IOutputDocument
) => (service: IOutputDeduplicationService): TE.TaskEither<Error, void> =>
  pipe(
    TE.Do,
    TE.bind("tableClient", () =>
      TE.of(
        getTableClient(indexName)(process.env.TABLE_STORAGE_CONNECTION_STRING)
      )
    ),
    defaultLog.taskEither.info(`tableStorageDeduplication => ${document}`),
    defaultLog.taskEither.info(`creating table => ${indexName}`),
    TE.chainFirst(({ tableClient }) =>
      getTableDocument(tableClient, indexName, document.id)
    ),
    defaultLog.taskEither.infoLeft(
      e => `Error getting document from index table => ${String(e)}`
    ),
    defaultLog.taskEither.info("indexing document"),
    TE.chainFirst(() =>
      TE.of(
        flow(
          O.map(() => service.update(indexName, document)),
          O.getOrElse(() => service.insert(indexName, document))
        )
      )
    ),
    TE.chainFirst(({ tableClient }) =>
      upsertTableDocument(tableClient, {
        rowKey: document.id,
        partitionKey: indexName,
        id: document.id
      })
    ),
    TE.map(constVoid)
  );
