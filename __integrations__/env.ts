import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as dotenv from "dotenv";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";

dotenv.config({ path: "./environments/.env" });

export const COSMOSDB_URI = process.env.COSMOSDB_URI;
export const COSMOSDB_KEY = process.env.COSMOSDB_KEY;
export const COSMOSDB_CONNECTION_STRING =
  process.env.COSMOSDB_CONNECTION_STRING ?? "COSMOSDB_CONNECTION_STRING";
export const COSMOSDB_NAME = process.env.COSMOSDB_NAME ?? "db";
export const ELASTIC_NODE = process.env.ELASTIC_NODE ?? "http://localhost:9200";
export const STORAGE_CONN_STRING = pipe(
  process.env.STORAGE_CONN_STRING,
  NonEmptyString.decode,
  E.getOrElse(
    () =>
      "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://storage-account:20003/devstoreaccount1;QueueEndpoint=http://storage-account:20004/devstoreaccount1;TableEndpoint=http://storage-account:20005/devstoreaccount1;" as NonEmptyString,
  ),
);
