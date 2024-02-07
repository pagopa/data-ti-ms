import * as EL from "@elastic/elasticsearch";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/lib/function";

export const deleteIndex = (
  elasticClient: EL.Client,
  indexName: string,
): TE.TaskEither<Error, void> =>
  pipe(
    TE.tryCatch(
      () => elasticClient.indices.delete({ index: indexName }),
      E.toError,
    ),
    TE.map(constVoid),
  );

export const deleteData = (
  elasticClient: EL.Client,
  indexName: string,
  id: string,
): TE.TaskEither<Error, void> =>
  pipe(
    TE.tryCatch(
      () => elasticClient.delete({ index: indexName, id: id }),
      E.toError,
    ),
    TE.map(constVoid),
  );
