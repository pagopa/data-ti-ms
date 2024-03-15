import * as E from "fp-ts/Either";
import * as OP from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";

export interface IBaseQueryEnrichmentParams<T> {
  readonly databaseName: string;
  readonly containerName: string;
  readonly idFieldValue: T[keyof T];
}

export type IKeyQueryEnrichmentParams<T> = IBaseQueryEnrichmentParams<T> & {
  readonly partitionKeyFieldValue?: T[keyof T];
};

export type IVersionedQueryEnrichmentParams<T> = IBaseQueryEnrichmentParams<
  T
> & {
  readonly partitionKeyFieldName: string;
  readonly partitionKeyFieldValue: T[keyof T];
  readonly versionFieldName: string;
};

export type IQueryEnrichmentParams<T> =
  | IKeyQueryEnrichmentParams<T>
  | IVersionedQueryEnrichmentParams<T>;

export type NotInKeys<T, K> = K extends keyof T ? never : K;
export type MappingFormatter<I, O> = (input: I) => E.Either<Error, O>;

export type MappingEnrichment<I, O> = (
  queryParams: IQueryEnrichmentParams<I>
) => TE.TaskEither<Error, OP.Option<O>>;

export type EnrichmentApplier<I, O> = (
  input: I
) => TE.TaskEither<Error, OP.Option<O>>;
