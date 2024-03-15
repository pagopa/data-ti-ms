import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { flow, pipe } from "fp-ts/lib/function";
import { IQueryEnrichmentParams, MappingEnrichment } from "../utils/types";
import { flattenField } from "../formatter/flatten";

const applyQueryEnrichment = <T, O>(
  params: IQueryEnrichmentParams<T>,
  idFieldName: keyof T,
  outputFieldName?: string
) => (queryEnrichmentFn: MappingEnrichment<T, O>) => (
  dataFlow: T
): TE.TaskEither<Error, O.Option<Record<string, unknown>>> =>
  pipe(
    queryEnrichmentFn(params),
    TE.map(
      flow(
        O.map(output =>
          pipe(
            outputFieldName,
            O.fromNullable,
            O.map(fieldName => E.right({ ...dataFlow, [fieldName]: output })),
            O.getOrElseW(() =>
              pipe(`${String(idFieldName)}_enrich`, flattenFieldName =>
                flattenField(flattenFieldName)({
                  ...dataFlow,
                  [flattenFieldName]: output
                })
              )
            ),
            O.fromEither
          )
        ),
        O.flatten
      )
    )
  );
export const applyFindByKeyQueryEnrichment = <
  T extends Record<string, unknown>,
  O
>(
  databaseName: string,
  containerName: string,
  idFieldName: keyof T,
  partitionKeyFieldName?: keyof T,
  outputFieldName?: string
) => (keyQueryEnrichmentFn: MappingEnrichment<T, O>) => (
  dataFlow: T
): TE.TaskEither<Error, O.Option<Record<string, unknown>>> =>
  pipe(
    {
      containerName,
      databaseName,
      idFieldValue: dataFlow[idFieldName],
      partitionKeyFieldValue: pipe(
        partitionKeyFieldName,
        O.fromNullable,
        O.map(fieldName => dataFlow[fieldName]),
        O.toUndefined
      )
    },
    params =>
      applyQueryEnrichment(
        params,
        idFieldName,
        outputFieldName
      )(keyQueryEnrichmentFn)(dataFlow)
  );

export const applyVersionedQueryEnrichment = <
  T extends Record<string, unknown>,
  O
>(
  databaseName: string,
  containerName: string,
  idFieldName: keyof T,
  partitionKeyFieldName: keyof T,
  versionFieldName: string,
  outputFieldName?: string
  // eslint-disable-next-line max-params
) => (versionedQueryEnrichmentFn: MappingEnrichment<T, O>) => (
  dataFlow: T
): TE.TaskEither<Error, O.Option<Record<string, unknown>>> =>
  pipe(
    {
      containerName,
      databaseName,
      idFieldValue: dataFlow[idFieldName],
      partitionKeyFieldValue: pipe(
        partitionKeyFieldName,
        O.fromNullable,
        O.map(fieldName => dataFlow[fieldName]),
        O.toUndefined
      ),
      versionFieldName
    },
    params =>
      applyQueryEnrichment(
        params,
        idFieldName,
        outputFieldName
      )(versionedQueryEnrichmentFn)(dataFlow)
  );
