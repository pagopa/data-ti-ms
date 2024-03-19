import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as BS from "@azure/storage-blob";
import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";

import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { flattenField } from "../../formatter/flatten";
import { getBlobDocument } from "../../utils/blobStorage";
import { toJsonObject } from "../../utils/data";

export const blobEnrich = <T extends Record<string, unknown>>(
  blobContainerClient: BS.ContainerClient,
  continueOnNotFound: boolean = true
) => (blobNameField: keyof T, outputFieldName?: string) => (
  input: T
): TE.TaskEither<Error, Record<string, unknown>> =>
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
            O.map(fieldName =>
              E.right({ ...input, [fieldName]: blobDocumentObject })
            ),
            O.getOrElseW(() =>
              pipe(`${String(blobNameField)}_enrich`, flattenFieldName =>
                flattenField(flattenFieldName)({
                  ...input,
                  [flattenFieldName]: blobDocumentObject
                })
              )
            )
          )
        ),
        O.getOrElse(() =>
          pipe(
            continueOnNotFound,
            E.fromPredicate(
              flag => flag,
              () =>
                Error(
                  `BlobDocument with name ${input[blobNameField]} not found`
                )
            ),
            E.map(() => input)
          )
        )
      )
    ),
    TE.chain(TE.fromEither)
  );
