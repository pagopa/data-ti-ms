import * as EL from "@elastic/elasticsearch";
import { GetResponse } from "@elastic/elasticsearch/lib/api/types";
import * as TE from "fp-ts/TaskEither";
import {
  IOutputDocument,
  getDocument,
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
  client: EL.Client
): IOutputDeduplicationService => ({
  get: getDocument(client),
  insert: indexDocument(client),
  update: updateIndexDocument(client)
});
