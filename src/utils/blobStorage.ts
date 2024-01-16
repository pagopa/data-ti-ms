import * as BS from "@azure/storage-blob";
import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as J from "fp-ts/Json";

export const getBlobContainerClient = (
  connectionString: string,
  containerName: string
): BS.ContainerClient =>
  pipe(
    BS.BlobServiceClient.fromConnectionString(connectionString),
    blobServiceClient => blobServiceClient.getContainerClient(containerName)
  );

export const getBlobDocument = (
  containerClient: BS.ContainerClient,
  blobName: string
): TE.TaskEither<Error, O.Option<J.Json>> =>
  pipe(
    containerClient.getBlobClient(blobName),
    blobClient =>
      TE.tryCatch(
        () => blobClient.download(),
        e => e as BS.RestError
      ),
    TE.map(O.some),
    TE.orElseW(restError =>
      pipe(
        restError.statusCode,
        TE.fromPredicate(
          statusCode => statusCode === 404,
          () => Error(`Error while retrieving Blob|ERROR=${restError.message}`)
        ),
        TE.map(() => O.none)
      )
    ),
    TE.chain(
      flow(
        O.map(downloadResponse =>
          pipe(
            downloadResponse.readableStreamBody.read().toString(),
            J.parse,
            E.mapLeft(E.toError),
            TE.fromEither,
            TE.map(O.some)
          )
        ),
        O.getOrElse(() => TE.right(O.none))
      )
    )
  );
