/* eslint-disable max-params */
import { CosmosClient, SqlQuerySpec } from "@azure/cosmos";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import {
  IKeyQueryEnrichmentParams,
  IVersionedQueryEnrichmentParams
} from "../../../utils/types";
export const findByKey = (client: CosmosClient) => <T>(
  params: IKeyQueryEnrichmentParams<T>
): TE.TaskEither<Error, O.Option<T>> =>
  pipe(
    TE.tryCatch(
      () =>
        client
          .database(params.databaseName)
          .container(params.containerName)
          .item(
            String(params.idFieldValue),
            String(params.partitionKeyFieldValue)
          )
          .read(),
      () =>
        new Error(
          `Impossible to get item ${params.idFieldValue} from container ${params.containerName}`
        )
    ),
    TE.map(resp => pipe(resp.resource, O.fromNullable))
  );

export const getQuery = (
  containerName: string,
  id: string,
  versionFieldName: string,
  partitionKeyField: string,
  partitionKeyValue: string
): SqlQuerySpec => ({
  parameters: [
    { name: `@id`, value: `${id}` },
    { name: `@${partitionKeyField}`, value: `${partitionKeyValue}` }
  ],
  query: `SELECT TOP 1 * FROM ${containerName} f WHERE  f.id = @id AND f.${partitionKeyField} = @${partitionKeyField} ORDER BY f.${versionFieldName} DESC`
});

export const findLastVersionByKey = (client: CosmosClient) => <T>(
  params: IVersionedQueryEnrichmentParams<T>
): TE.TaskEither<Error, O.Option<Record<string, unknown>>> =>
  pipe(
    TE.tryCatch(
      () =>
        client
          .database(params.databaseName)
          .container(params.containerName)
          .items.query(
            getQuery(
              params.containerName,
              String(params.idFieldValue),
              params.versionFieldName,
              params.partitionKeyFieldName,
              String(params.partitionKeyFieldValue)
            )
          )
          .fetchAll(),
      () =>
        new Error(
          `Impossible to get last version of the item ${params.idFieldValue} from container ${params.containerName}`
        )
    ),
    TE.map(resp => resp.resources),
    TE.map(RA.head)
  );
