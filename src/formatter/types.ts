import * as E from "fp-ts/Either";
export type MappingFormatter<I, O> = (input: I) => E.Either<Error, O>;
