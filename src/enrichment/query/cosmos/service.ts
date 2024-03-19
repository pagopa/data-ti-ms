import { CosmosClient } from "@azure/cosmos";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { IQueryEnrichmentParams } from "../../../utils/types";
import { findByKey, findLastVersionByKey } from "./utils";

export type QueryClient = CosmosClient;

export interface IQueueEnrichment<T extends Record<string, unknown>> {
  readonly findByKey: (
    params: IQueryEnrichmentParams<T>
  ) => TE.TaskEither<Error, O.Option<T>>;

  readonly findLastVersionByKey: (
    params: IQueryEnrichmentParams<T>
  ) => TE.TaskEither<Error, O.Option<Record<string, unknown>>>;
}

export const createCosmosQueryEnrichmentService = <
  T extends Record<string, unknown>
>(
  connectionString: string
): E.Either<Error, IQueueEnrichment<T>> =>
  pipe(
    E.tryCatch(() => new CosmosClient(connectionString), E.toError),
    E.map(client => ({
      findByKey: findByKey(client),
      findLastVersionByKey: findLastVersionByKey(client)
    }))
  );
