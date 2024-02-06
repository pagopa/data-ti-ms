/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable extra-rules/no-commented-out-code */
/* eslint-disable no-underscore-dangle */
import * as EL from "@elastic/elasticsearch";
import { defaultLog } from "@pagopa/winston-ts";
import * as TE from "fp-ts/TaskEither";
import * as B from "fp-ts/boolean";
import { constVoid, pipe } from "fp-ts/lib/function";
import { IOutputDocument } from "./elasticsearch/elasticsearch";
import { IOutputDeduplicationService } from "./elasticsearch/service";
export const timestampDeduplication = (
  indexName: string,
  document: IOutputDocument
) => (service: IOutputDeduplicationService): TE.TaskEither<Error, void> =>
  pipe(
    service.get(indexName, document),
    TE.bimap(
      resErr => resErr,
      docRead =>
        pipe(
          document._timestamp > docRead.fields._timestamp,
          B.fold(
            () => constVoid(),
            () =>
              pipe(
                service.update(indexName, document),
                defaultLog.taskEither.info(
                  `Document has a greater timestamp than the one in the index => updating index`
                ),
                TE.map(constVoid)
              )
          )
        )
    ),
    TE.orElseW(resErr =>
      pipe(
        (resErr as EL.errors.ResponseError).statusCode !== 404,
        B.fold(
          () => pipe(service.insert(indexName, document), TE.map(constVoid)),
          () => TE.right(constVoid())
        )
      )
    )
  );
