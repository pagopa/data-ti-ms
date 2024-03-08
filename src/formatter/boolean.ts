import * as B from "fp-ts/boolean";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

export const booleanToString = (trueString: string, falseString: string) => (
  bool: boolean
): E.Either<Error, string> =>
  pipe(
    bool,
    B.fold(
      () => falseString,
      () => trueString
    ),
    E.right
  );
