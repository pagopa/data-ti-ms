import * as DT from "@azure/data-tables";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";

export const createTableIfNotExists = (
  tableClient: DT.TableClient,
): TE.TaskEither<Error, void> =>
  pipe(new AbortController(), (controller) =>
    TE.tryCatch(
      () => tableClient.createTable({ abortSignal: controller.signal }),
      E.toError,
    ),
  );

export const deleteTableWithAbort = (
  tableClient: DT.TableClient,
): TE.TaskEither<Error, void> =>
  pipe(new AbortController(), (controller) =>
    TE.tryCatch(
      () => tableClient.deleteTable({ abortSignal: controller.signal }),
      E.toError,
    ),
  );
