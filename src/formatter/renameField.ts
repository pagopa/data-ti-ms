import { ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";

import { pipe } from "fp-ts/function";

export const renameField = <T>(input: T, field: keyof T, newField: string): T =>
  pipe({ ...input, [field]: undefined, [newField]: input[field] }, res =>
    withoutUndefinedValues(res)
  );

export const renameFields = <T>(
  input: T,
  renameChanges: ReadonlyArray<ITuple2<keyof T, string>>
): T =>
  renameChanges.reduce(
    (acc, currChange) => renameField(acc, currChange.e1, currChange.e2),
    input
  );
