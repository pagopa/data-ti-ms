/* eslint-disable sonarjs/no-identical-functions */
import * as EL from "@elastic/elasticsearch";
import { GetResponse } from "@elastic/elasticsearch/lib/api/types";
import { defaultLog } from "@pagopa/winston-ts";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as B from "fp-ts/boolean";
import { constVoid, pipe } from "fp-ts/lib/function";

export interface IOutputDocument {
  readonly [key: string]: unknown;
  readonly id: string;
}

export const getElasticClient = (
  elasticNode: string
): E.Either<Error, EL.Client> =>
  E.tryCatch(() => new EL.Client({ node: elasticNode }), E.toError);

export const createIndex = (
  elasticClient: EL.Client,
  indexName: string
): TE.TaskEither<Error, boolean> =>
  pipe(
    TE.tryCatch(
      () => elasticClient.indices.create({ index: indexName }),
      E.toError
    ),
    TE.map(res => res.acknowledged)
  );

export const createIndexIfNotExists = (
  elasticClient: EL.Client,
  indexName: string
): TE.TaskEither<Error, boolean> =>
  pipe(
    TE.tryCatch(
      () => elasticClient.indices.exists({ index: indexName }),
      E.toError
    ),
    TE.chain(
      B.fold(
        () => createIndex(elasticClient, indexName),
        () => TE.right(true)
      )
    )
  );

export const getDocument = (elasticClient: EL.Client) => (
  indexName: string,
  document: IOutputDocument
): TE.TaskEither<Error, GetResponse> =>
  pipe(
    TE.Do,
    defaultLog.taskEither.info(`getAndIndexDocument => ${document}`),
    () =>
      TE.tryCatch(
        () => elasticClient.get({ id: document.id, index: indexName }),
        E.toError
      ),
    defaultLog.taskEither.infoLeft(
      e => `Error getting document from index => ${String(e)}`
    )
  );

export const indexDocument = (elasticClient: EL.Client) => (
  indexName: string,
  document: IOutputDocument
): TE.TaskEither<Error, void> =>
  pipe(
    TE.tryCatch(
      () =>
        elasticClient.index({
          document,
          id: document.id,
          index: indexName
        }),
      E.toError
    ),
    TE.bimap(E.toError, response =>
      pipe(
        response.result !== "created" && response.result !== "updated",
        B.fold(
          () => constVoid(),
          () =>
            TE.left(
              new Error(
                "Error indexing document - Status not created - " +
                  response.result
              )
            )
        )
      )
    )
  );

export const updateIndexDocument = (elasticClient: EL.Client) => (
  indexName: string,
  document: IOutputDocument
): TE.TaskEither<Error, void> =>
  pipe(
    TE.tryCatch(
      () =>
        elasticClient.update({
          doc: document,
          id: document.id,
          index: indexName
        }),
      E.toError
    ),
    TE.bimap(E.toError, response =>
      pipe(
        response.result !== "created" && response.result !== "updated",
        B.fold(
          () => constVoid(),
          () =>
            TE.left(
              new Error(
                "Error indexing document - Status not created - " +
                  response.result
              )
            )
        )
      )
    )
  );
