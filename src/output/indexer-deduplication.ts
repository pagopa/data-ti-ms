/* eslint-disable no-underscore-dangle */
import { defaultLog } from "@pagopa/winston-ts";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import { IOutputDocument } from "./elasticsearch/elasticsearch";
import { IOutputService } from "./elasticsearch/service";

export const indexerDeduplication = (
  indexName: string,
  document: IOutputDocument
) => (service: IOutputService): TE.TaskEither<Error, void> =>
  pipe(
    service.get(indexName, document),
    TE.map(O.some),
    TE.orElseW(
      flow(
        TE.fromPredicate(
          err => err.statusCode === 404,
          err =>
            Error(
              `Error while getting document from index - ${JSON.stringify(err)}`
            )
        ),
        TE.chain(() =>
          pipe(
            service.insert(indexName, document),
            TE.bimap(
              () => new Error("Error during the insert of the document"),
              () => O.none
            )
          )
        )
      )
    ),
    TE.chain(
      flow(
        O.chain(
          O.fromPredicate(docRead =>
            pipe(
              docRead._source,
              O.fromNullable,
              O.fold(
                () => false,
                sourceDoc => document._timestamp > sourceDoc._timestamp
              )
            )
          )
        ),
        O.map(() =>
          pipe(
            service.update(indexName, document),
            defaultLog.taskEither.info(
              `Document has a greater timestamp than the one in the index => updating index`
            )
          )
        ),
        O.getOrElse(() => TE.right(void 0))
      )
    )
  );
