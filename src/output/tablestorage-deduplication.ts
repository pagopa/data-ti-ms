/* eslint-disable sort-keys */
import { defaultLog } from "@pagopa/winston-ts";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { constVoid, flow, pipe } from "fp-ts/lib/function";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import {
  getTableClient,
  getTableDocument,
  upsertTableDocument
} from "../utils/tableStorage";
import { IOutputDocument } from "./elasticsearch/elasticsearch";
import { IOutputService } from "./elasticsearch/service";

export const tableStorageDeduplication = (
  tableStorageConnectionString: NonEmptyString
) => (indexName: string, document: IOutputDocument) => (
  service: IOutputService
): TE.TaskEither<Error, void> =>
  pipe(
    TE.Do,
    TE.bind("tableClient", () =>
      TE.of(getTableClient(indexName)(tableStorageConnectionString))
    ),
    defaultLog.taskEither.info(`tableStorageDeduplication => ${document}`),
    TE.chain(({ tableClient }) =>
      pipe(
        getTableDocument<IOutputDocument>(tableClient, indexName, document.id),
        defaultLog.taskEither.infoLeft(
          e => `Error getting document from index table => ${String(e)}`
        ),
        defaultLog.taskEither.info("indexing document"),
        TE.chain(
          flow(
            O.fold(
              () =>
                pipe(
                  service.insert(indexName, document),
                  TE.map(() => O.some(document))
                ),
              flow(
                O.fromPredicate(
                  // eslint-disable-next-line no-underscore-dangle
                  retrievedDoc => retrievedDoc._timestamp < document._timestamp
                ),
                O.map(() =>
                  pipe(
                    service.update(indexName, document),
                    TE.map(() => O.some(document))
                  )
                ),
                O.getOrElse(() => TE.right(O.none))
              )
            ),
            TE.chain(
              flow(
                O.map(() =>
                  pipe(
                    upsertTableDocument(tableClient, {
                      rowKey: document.id,
                      partitionKey: indexName,
                      id: document.id,
                      // eslint-disable-next-line no-underscore-dangle
                      _timestamp: document._timestamp
                    }),
                    TE.map(constVoid)
                  )
                ),
                O.getOrElse(() => TE.right(void 0))
              )
            )
          )
        )
      )
    )
  );
