import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";

export type MappingFormatter<I, O> = (input: I) => E.Either<Error, O>;

export type MappingEnrichment<I, O> = (input: I) => TE.TaskEither<Error, O>;
