import * as TE from "fp-ts/TaskEither";
import { IOutputDocument } from "./elasticsearch/elasticsearch";
import { IOutputDeduplicationService } from "./elasticsearch/service";
import { timestampDeduplication } from "./timestamp-deduplication";

export interface IDeduplicationStrategy {
  readonly execute: (
    indexName: string,
    document: IOutputDocument
  ) => (service: IOutputDeduplicationService) => TE.TaskEither<Error, void>;
}

export const timestampDeduplicationStrategy: IDeduplicationStrategy = {
  execute: timestampDeduplication
};
