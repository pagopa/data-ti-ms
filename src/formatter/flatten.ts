import * as O from "fp-ts/Option";
import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/lib/function";
import { toJsonObject } from "../utils/data";

export const flattenField = <T>(input: T, fieldToFlat: keyof T): T =>
  pipe(
    input,
    O.fromPredicate(stream => stream[fieldToFlat] instanceof Object),
    O.map(data => pipe(data[fieldToFlat], toJsonObject)),
    O.map(objToFlat =>
      pipe(
        objToFlat,
        Object.keys,
        objectFieldNames =>
          objectFieldNames.reduce(
            (acc, fieldName) =>
              Object.keys(input).includes(fieldName)
                ? {
                    ...acc,
                    [`${String(fieldToFlat)}_${fieldName}`]: objToFlat[
                      fieldName
                    ]
                  }
                : { ...acc, [fieldName]: objToFlat[fieldName] },
            {}
          ),
        flattenedContent => ({ ...input, ...flattenedContent }),
        result =>
          withoutUndefinedValues({
            ...result,
            [fieldToFlat]: undefined
          })
      )
    ),
    O.getOrElse(() => input)
  );
