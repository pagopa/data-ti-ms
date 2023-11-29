import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as AR from "fp-ts/lib/Array";

export const upperCaseFormat = (s: string): string => s.toUpperCase();

export const lowerCaseFormat = (s: string): string => s.toLowerCase();

export const capitalizeFormat = (s: string): string =>
  pipe(
    s,
    lowerCaseFormat,
    low => low.split(""),
    strArr =>
      pipe(
        strArr,
        AR.head,
        O.map(upperCaseFormat),
        O.map(firstLetter => `${firstLetter}${strArr.join("").slice(1)}`),
        O.getOrElse(() => "")
      )
  );

export const trimFormat = (s: string): string => s.trim();

export const replaceFormat = (s: string) => (
  toBeReplaced: string,
  placeholder: string
): string => s.replace(toBeReplaced, placeholder);

const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

export const replaceAllFormat = (s: string) => (
  toBeReplaced: string,
  placeholder: string
): string =>
  s.replace(new RegExp(escapeRegExp(toBeReplaced), "g"), placeholder);
