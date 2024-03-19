import { pipe } from "fp-ts/lib/function";
import { getBlobContainerClient } from "../../utils/blobStorage";
import { getTableClient } from "../../utils/tableStorage";
import { blobEnrich } from "./blob";
import { tableEnrich } from "./table";

export const createBlobStorageEnrichmentService = (
  connectionString: string,
  containerName: string
): ReturnType<typeof blobEnrich> =>
  pipe(
    getBlobContainerClient(connectionString, containerName),
    containerClient => blobEnrich(containerClient)
  );

export const createTableStorageEnrichmentService = (
  connectionString: string,
  tableName: string
): ReturnType<typeof tableEnrich> =>
  pipe(getTableClient(connectionString)(tableName), tableClient =>
    tableEnrich(tableClient)
  );
