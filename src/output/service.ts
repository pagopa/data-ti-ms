import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { getTableClient } from "../utils/tableStorage";
import { IOutputDocument } from "./elasticsearch/elasticsearch";
import { IOutputService } from "./elasticsearch/service";
import { indexerDeduplication } from "./indexer-deduplication";
import { tableStorageDeduplication } from "./tablestorage-deduplication";
import { TableDeduplicationStrategyConfig } from "./factory";

export interface IDeduplicationStrategy {
  readonly execute: (
    indexName: string,
    document: IOutputDocument
  ) => (service: IOutputService) => TE.TaskEither<Error, void>;
}

export const indexerDeduplicationStrategy: IDeduplicationStrategy = {
  execute: indexerDeduplication
};

export const tableStorageDeduplicationStrategy = (
  config: TableDeduplicationStrategyConfig
): IDeduplicationStrategy =>
  pipe(
    getTableClient(
      config.tableName,
      config.opts
    )(config.storageConnectionString),
    tableClient => ({
      execute: tableStorageDeduplication(tableClient)
    })
  );
