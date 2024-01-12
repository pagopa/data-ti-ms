import { ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";

import { pipe } from "fp-ts/function";

type NotInKeys<T, K extends string> = K extends keyof T ? never : K;

export const renameField = <T, K extends string>(
  input: T,
  field: keyof T,
  newField: NotInKeys<T, K>
): T =>
  pipe({ ...input, [field]: undefined, [newField]: input[field] }, res =>
    withoutUndefinedValues(res)
  );

export const renameFields = <T, K extends string>(
  input: T,
  renameChanges: ReadonlyArray<ITuple2<keyof T, NotInKeys<T, K>>>
): T =>
  renameChanges.reduce(
    (acc, currChange) => renameField(acc, currChange.e1, currChange.e2),
    input
  );
