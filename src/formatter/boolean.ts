import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/boolean";

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
