import * as AR from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

export const upperCaseFormat = (s: string): E.Either<Error, string> =>
  E.right(s.toUpperCase());

export const lowerCaseFormat = (s: string): E.Either<Error, string> =>
  E.right(s.toLowerCase());

export const capitalizeFormat = (s: string): E.Either<Error, string> =>
  pipe(
    s,
    lowerCaseFormat,
    E.map(low => low.split("")),
    E.chain(strArr =>
      pipe(
        strArr,
        AR.head,
        O.map(upperCaseFormat),
        O.map(firstLetter => `${firstLetter}${strArr.join("").slice(1)}`),
        O.getOrElse(() => ""),
        E.right
      )
    )
  );

export const trimFormat = (s: string): E.Either<Error, string> =>
  E.right(s.trim());

export const replaceFormat = (toBeReplaced: string, placeholder: string) => (
  s: string
): E.Either<Error, string> => E.right(s.replace(toBeReplaced, placeholder));

const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

export const replaceAllFormat = (toBeReplaced: string, placeholder: string) => (
  s: string
): E.Either<Error, string> =>
  E.right(s.replace(new RegExp(escapeRegExp(toBeReplaced), "g"), placeholder));
