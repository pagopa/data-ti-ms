import * as EL from "@elastic/elasticsearch";
import { GetResponse } from "@elastic/elasticsearch/lib/api/types";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  IOutputDocument,
  getDocument,
  getElasticClient,
  indexDocument,
  updateIndexDocument
} from "./elasticsearch";

export type OutputClient = EL.Client;
export type OutputDataRead = GetResponse;
export type OutputDataWrite = EL.estypes.Result;
export interface IOutputDeduplicationService {
  readonly get: (
    indexName: string,
    document: IOutputDocument
  ) => TE.TaskEither<Error, OutputDataRead>;
  readonly insert: (
    indexName: string,
    document: IOutputDocument
  ) => TE.TaskEither<Error, OutputDataWrite>;
  readonly update: (
    indexName: string,
    document: IOutputDocument
  ) => TE.TaskEither<Error, OutputDataWrite>;
}

export const getElasticSearchService = (
  connectionString: string
): E.Either<Error, IOutputDeduplicationService> =>
  pipe(
    getElasticClient(connectionString),
    E.map(client => ({
      get: getDocument(client),
      insert: indexDocument(client),
      update: updateIndexDocument(client)
    }))
  );
