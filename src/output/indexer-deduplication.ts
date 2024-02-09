/* eslint-disable no-underscore-dangle */
import { defaultLog } from "@pagopa/winston-ts";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as B from "fp-ts/boolean";
import { flow, pipe } from "fp-ts/lib/function";
import { IOutputDocument } from "./elasticsearch/elasticsearch";
import { IOutputDeduplicationService } from "./elasticsearch/service";

export const indexerDeduplication = (
  indexName: string,
  document: IOutputDocument
) => (service: IOutputDeduplicationService): TE.TaskEither<Error, void> =>
  pipe(
    service.get(indexName, document),
    TE.map(O.some),
    TE.orElseW(err =>
      pipe(
        err.statusCode !== 404,
        B.fold(
          () =>
            pipe(
              service.insert(indexName, document),
              TE.map(() => O.none)
            ),
          () => TE.right(O.none)
        ),
        TE.mapLeft(() => new Error("Error during the insert of the document"))
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
                doc => document._timestamp > doc._timestamp
              )
            )
          )
        ),
        O.map(() =>
          pipe(
            service.update(indexName, document),
            defaultLog.taskEither.info(
              `Document has a greater timestamp than the one in the index => updating index`
            ),
            TE.map(() => void 0)
          )
        ),
        O.getOrElse(() => TE.right(void 0))
      )
    )
  );
