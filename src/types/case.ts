import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

export const SwitchCaseMapping = t.type({
  cases: t.record(t.string, t.unknown),
  defaultValue: t.unknown,
  inputFieldName: NonEmptyString
});

export type SwitchCaseMapping = t.TypeOf<typeof SwitchCaseMapping>;
