import * as EL from "@elastic/elasticsearch";
import { GetResponse } from "@elastic/elasticsearch/lib/api/types";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  IOutputDocument,
  IOutputError,
  getDocument,
  getElasticClient,
  indexDocument,
  updateIndexDocument
} from "./elasticsearch";

export type OutputClient = EL.Client;
export type OutputDataRead = GetResponse<IOutputDocument>;
export type OutputDataWrite = EL.estypes.Result;
export interface IOutputService {
  readonly get: (
    indexName: string,
    document: IOutputDocument
  ) => TE.TaskEither<IOutputError, OutputDataRead>;
  readonly insert: (
    indexName: string,
    document: IOutputDocument
  ) => TE.TaskEither<Error, void>;
  readonly update: (
    indexName: string,
    document: IOutputDocument
  ) => TE.TaskEither<Error, void>;
}

export const getElasticSearchService = (
  connectionString: string
): E.Either<Error, IOutputService> =>
  pipe(
    getElasticClient(connectionString),
    E.map(client => ({
      get: getDocument(client),
      insert: indexDocument(client),
      update: updateIndexDocument(client)
    }))
  );
