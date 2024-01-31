/* eslint-disable max-params */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-let */
import { CosmosClient, SqlQuerySpec } from "@azure/cosmos";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
export const findByKey = (
  client: CosmosClient,
  database: string,
  containerName: string,
  id: string,
  partitionKey?: string
): TE.TaskEither<Error, O.Option<unknown>> =>
  pipe(
    TE.tryCatch(
      () =>
        client
          .database(database)
          .container(containerName)
          .item(id, partitionKey)
          .read(),
      () =>
        new Error(
          `Impossible to get item ${id} from container ${containerName}`
        )
    ),
    TE.map(resp => pipe(resp.resource, O.fromNullable))
  );

export const getQuery = (
  containerName: string,
  id: string,
  versionFieldName: string,
  versionFieldValue: string,
  partitionKey: string
): SqlQuerySpec => ({
  parameters: [
    { name: `@${versionFieldName}`, value: `${versionFieldValue}` },
    { name: `@id`, value: `${id}` },
    { name: `@partitionKey`, value: `${partitionKey}` }
  ],
  query: `SELECT * FROM ${containerName} f WHERE  f.id = @id AND f.${versionFieldName} = @${versionFieldName} AND f.partitionKey = @partitionKey`
});

export const findLastVersionByKey = (
  client: CosmosClient,
  database: string,
  containerName: string,
  versionFieldName: string,
  versionFieldValue: string,
  id: string,
  partitionKey: string
): TE.TaskEither<Error, ReadonlyArray<unknown>> =>
  pipe(
    TE.tryCatch(
      () =>
        client
          .database(database)
          .container(containerName)
          .items.query(
            getQuery(
              containerName,
              id,
              versionFieldName,
              versionFieldValue,
              partitionKey
            )
          )
          .fetchAll(),
      () =>
        new Error(
          `Impossible to get last version of the item ${id} from container ${containerName}`
        )
    ),
    TE.map(resp => resp.resources)
  );
