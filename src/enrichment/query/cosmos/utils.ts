import { CosmosClient } from "@azure/cosmos";
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
