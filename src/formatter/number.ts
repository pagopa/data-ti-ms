import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
export const multiplyNumber = (n: number, multiplier: number): number =>
  n * multiplier;

const divide = (n: number, divisor: number): O.Option<number> =>
  pipe(
    divisor,
    O.fromPredicate(d => d !== 0),
    O.map(d => n / d)
  );

export const divideNumber = (n: number, divisor: number): number =>
  pipe(
    divide(n, divisor),
    O.getOrElse(() => 0)
  );

const round = (n: number, decimals: number): O.Option<number> =>
  pipe(
    decimals,
    O.fromPredicate(d => d >= 0),
    O.map(d => parseFloat(n.toFixed(d)))
  );

export const roundNumber = (n: number, decimals: number): number =>
  pipe(
    round(n, decimals),
    O.getOrElse(() => n)
  );
