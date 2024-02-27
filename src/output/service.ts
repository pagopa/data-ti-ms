import * as TE from "fp-ts/TaskEither";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { IOutputDocument } from "./elasticsearch/elasticsearch";
import { IOutputDeduplicationService } from "./elasticsearch/service";
import { indexerDeduplication } from "./indexer-deduplication";
import { tableStorageDeduplication } from "./tablestorage-deduplication";

export interface IDeduplicationStrategy {
  readonly execute: (
    indexName: string,
    document: IOutputDocument
  ) => (service: IOutputDeduplicationService) => TE.TaskEither<Error, void>;
}

export const indexerDeduplicationStrategy: IDeduplicationStrategy = {
  execute: indexerDeduplication
};

export const tableStorageDeduplicationStrategy = (
  storageConnectionString: NonEmptyString
): IDeduplicationStrategy => ({
  execute: tableStorageDeduplication(storageConnectionString)
});
