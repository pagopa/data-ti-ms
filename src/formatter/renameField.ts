import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";

import { pipe } from "fp-ts/function";

export const renameField = <T>(input: T, field: keyof T, newField: string): T =>
  pipe({ ...input, [field]: undefined, [newField]: input[field] }, res =>
    withoutUndefinedValues(res)
  );
