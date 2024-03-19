import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";

export const applyEitherReducer = <I extends Record<string, unknown>>(
  fns: ReadonlyArray<(input: I) => E.Either<Error, Record<string, unknown>>>
) => (input: I): E.Either<Error, Record<string, unknown>> =>
  fns.reduce(
    (acc, currChange) => pipe(acc, E.chain(currChange)),
    E.right(input)
  );

export const applyTaskEitherReducer = <I extends Record<string, unknown>>(
  fns: ReadonlyArray<
    (input: I) => TE.TaskEither<Error, Record<string, unknown>>
  >
) => (input: I): TE.TaskEither<Error, Record<string, unknown>> =>
  fns.reduce(
    (acc, currChange) => pipe(acc, TE.chain(currChange)),
    TE.right(input)
  );
