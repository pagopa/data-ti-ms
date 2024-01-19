import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as BS from "@azure/storage-blob";
import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";

import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { getBlobDocument } from "../utils/blobStorage";
import { NotInKeys } from "../utils/types";
import { toJsonObject } from "../utils/data";

export const blobEnrich = <T, K extends string>(
  input: T,
  blobContainerClient: BS.ContainerClient,
  blobNameField: keyof T,
  outputFieldName?: NotInKeys<T, K>
): TE.TaskEither<Error, T> =>
  pipe(
    input[blobNameField],
    NonEmptyString.decode,
    E.mapLeft(errs =>
      Error(
        `Given Blob name field from input stream is not valid|Error=${errorsToReadableMessages(
          errs
        )}`
      )
    ),
    TE.fromEither,
    TE.chain(blobName => getBlobDocument(blobContainerClient, blobName)),
    TE.map(
      flow(
        O.map(toJsonObject),
        O.map(blobDocumentObject =>
          pipe(
            outputFieldName,
            O.fromNullable,
            O.map(fieldName => ({ ...input, [fieldName]: blobDocumentObject })),
            O.getOrElseW(() => ({
              ...input,
              ...blobDocumentObject
            }))
          )
        ),
        O.getOrElse(() => input)
      )
    )
  );
