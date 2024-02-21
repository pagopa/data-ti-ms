/* eslint-disable sort-keys */
import { TableClient } from "@azure/data-tables";
import * as EL from "@elastic/elasticsearch";
import { defaultLog } from "@pagopa/winston-ts";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { constVoid, flow, pipe } from "fp-ts/lib/function";
import { getTableDocument, upsertTableDocument } from "../utils/tableStorage";
import {
  IOutputDocument,
  indexDocument,
  updateIndexDocument
} from "./elasticsearch/elasticsearch";
export const tableStorageDeduplication = (
  elasticClient: EL.Client,
  tableClient: TableClient,
  indexName: string
) => (document: IOutputDocument): TE.TaskEither<Error, void> =>
  pipe(
    TE.Do,
    defaultLog.taskEither.info(`tableStorageDeduplication => ${document}`),
    defaultLog.taskEither.info(`creating table => ${indexName}`),
    () => getTableDocument(tableClient, indexName, document.id),
    defaultLog.taskEither.infoLeft(
      e => `Error getting document from index table => ${String(e)}`
    ),
    defaultLog.taskEither.info("indexing document"),
    TE.chain(
      flow(
        O.map(() => updateIndexDocument(elasticClient)(indexName, document)),
        O.getOrElse(() => indexDocument(elasticClient)(indexName, document))
      )
    ),
    TE.chain(() =>
      upsertTableDocument(tableClient, {
        rowKey: document.id,
        partitionKey: indexName,
        id: document.id
      })
    ),
    TE.map(constVoid)
  );
