import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
export const multiplyNumber = (multiplier: number) => (
  n: number
): E.Either<Error, number> => E.right(n * multiplier);

const divide = (n: number, divisor: number): O.Option<number> =>
  pipe(
    divisor,
    O.fromPredicate(d => d !== 0),
    O.map(d => n / d)
  );

export const divideNumber = (divisor: number) => (
  n: number
): E.Either<Error, number> =>
  pipe(
    divide(n, divisor),
    O.getOrElse(() => 0),
    E.right
  );

const round = (n: number, decimals: number): O.Option<number> =>
  pipe(
    decimals,
    O.fromPredicate(d => d >= 0),
    O.map(d => parseFloat(n.toFixed(d)))
  );

export const roundNumber = (decimals: number) => (
  n: number
): E.Either<Error, number> =>
  pipe(
    round(n, decimals),
    O.getOrElse(() => n),
    E.right
  );
