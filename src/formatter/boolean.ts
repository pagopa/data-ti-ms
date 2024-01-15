import * as B from "fp-ts/boolean";
import { pipe } from "fp-ts/function";

export const booleanToString = (trueString: string, falseString: string) => (
  bool: boolean
): string =>
  pipe(
    bool,
    B.fold(
      () => falseString,
      () => trueString
    )
  );
