import { ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/function";
import { NotInKeys } from "../utils/types";

export const renameField = <T, R extends keyof T, K extends string>(
  input: T,
  inputFieldName: R,
  newFieldName: NotInKeys<T, K>
): T =>
  pipe(
    {
      ...input,
      [inputFieldName]: undefined,
      [newFieldName]: input[inputFieldName]
    },
    res => withoutUndefinedValues(res)
  );

export const renameFields = <T, R extends keyof T, K extends string>(
  input: T,
  renameChanges: ReadonlyArray<ITuple2<R, NotInKeys<T, K>>>
): T =>
  renameChanges.reduce(
    (acc, currChange) => renameField(acc, currChange.e1, currChange.e2),
    input
  );
