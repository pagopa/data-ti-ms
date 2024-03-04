import { defaultLog } from "@pagopa/winston-ts";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  IOutputDocument,
  createIndexIfNotExists,
  getElasticClient,
} from "../../../../src/output/elasticsearch/elasticsearch";
import { getElasticSearchService } from "../../../../src/output/elasticsearch/service";
import {
  DeduplicationStrategyConfig,
  DeduplicationStrategyType,
  getDeduplicationStrategy,
} from "../../../../src/output/factory";
import { ELASTIC_NODE, STORAGE_CONN_STRING } from "../../../env";
import {
  getTableClient,
  getTableDocument,
} from "../../../../src/utils/tableStorage";
import { deleteIndex } from "../../../utils/elasticsearch";
import { createTableIfNotExists, deleteTableWithAbort } from "../../../utils/table";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

const INDEX_NAME = "index" as NonEmptyString;
const FIRST_ID = "first_id";

const currentTimestamp = Date.now();
const oldTimestamp = new Date(currentTimestamp - 86400000).getTime();

const getNewerDocument = (id: string = FIRST_ID) => ({
  id,
  _timestamp: currentTimestamp,
  value: "first",
});

const getOlderDocument = (id: string = FIRST_ID) => ({
  id,
  _timestamp: oldTimestamp,
  value: "first",
});

const tableDeduplicationStrategyConfig: DeduplicationStrategyConfig = {
  type: DeduplicationStrategyType.TableStorage,
  tableName: INDEX_NAME,
  storageConnectionString: STORAGE_CONN_STRING,
  opts: {
    allowInsecureConnection: true
  }
};

describe("table deduplication", () => {
  beforeAll(async () => {
    await pipe(
      getElasticClient(ELASTIC_NODE),
      TE.fromEither,
      TE.chainFirst((client) => createIndexIfNotExists(client, INDEX_NAME)),
      TE.chain(() =>
        createTableIfNotExists(
          getTableClient(INDEX_NAME, { allowInsecureConnection: true })(
            STORAGE_CONN_STRING,
          ),
        ),
      ),
      TE.getOrElse((e) => {
        throw Error(
          `Cannot initialize integration tests - ${JSON.stringify(e.message)}`,
        );
      }),
    )();
  }, 10000);

  afterAll(async () => {
    await pipe(
      getElasticClient(ELASTIC_NODE),
      TE.fromEither,
      TE.chainFirst((client) => deleteIndex(client, INDEX_NAME)),
      TE.chain(() =>
        deleteTableWithAbort(
          getTableClient(INDEX_NAME, { allowInsecureConnection: true })(
            STORAGE_CONN_STRING,
          ),
        ),
      ),
      TE.getOrElse((e) => {
        throw Error(
          `Cannot destroy integration tests data - ${JSON.stringify(e.message)}`,
        );
      }),
    )();
  }, 10000);
  it("should create the document if it doesn't exists", async () => {
    const olderDocument = getOlderDocument();
    await pipe(
      E.Do,
      E.bind("service", () => getElasticSearchService(ELASTIC_NODE)),
      E.bind("strategy", () =>
        E.tryCatch(
          () => getDeduplicationStrategy(tableDeduplicationStrategyConfig),
          E.toError,
        ),
      ),
      TE.fromEither,
      TE.chainFirst(({ service, strategy }) =>
        strategy.execute(INDEX_NAME, olderDocument)(service),
      ),
      TE.bimap(
        (err) =>
          Error(
            `it should not fail while finding an existing index - ${err.message}`,
          ),
        ({ service }) =>
          pipe(
            service.get(INDEX_NAME, olderDocument),
            defaultLog.taskEither.info((doc) => `Doc retrieved ${doc._source}`),
            TE.bimap(E.toError, (doc) =>
              expect(doc._source).toEqual(olderDocument),
            ),
            TE.chain(() =>
              pipe(
                getTableClient(INDEX_NAME, { allowInsecureConnection: true })(
                  STORAGE_CONN_STRING,
                ),
                TE.of,
                TE.chain((tableClient) =>
                  getTableDocument<IOutputDocument>(
                    tableClient,
                    INDEX_NAME,
                    olderDocument.id,
                  ),
                ),
                TE.chain(
                  TE.fromOption(() => Error("Table document should exists")),
                ),
                TE.map((tableDoc) => expect(tableDoc).toEqual(olderDocument)),
              ),
            ),
          ),
      ),
      TE.mapLeft((e) => {
        throw e;
      }),
    )();
  });

  it("should update the document when it has a greater timestamp than the one in the index", async () => {
    const newerDocument = getNewerDocument();
    await pipe(
      E.Do,
      E.bind("service", () => getElasticSearchService(ELASTIC_NODE)),
      E.bind("strategy", () =>
        E.tryCatch(
          () => getDeduplicationStrategy(tableDeduplicationStrategyConfig),
          E.toError,
        ),
      ),
      TE.fromEither,
      TE.chainFirst(({ service, strategy }) =>
        strategy.execute(INDEX_NAME, newerDocument)(service),
      ),
      TE.bimap(
        (err) =>
          new Error(
            `it should not fail while finding an existing index - ${err.message}`,
          ),
        ({ service }) =>
          pipe(
            service.get(INDEX_NAME, newerDocument),
            defaultLog.taskEither.info((doc) => `Doc retrieved ${doc._source}`),
            TE.bimap(E.toError, (doc) =>
              expect(doc._source).toEqual(newerDocument),
            ),
          ),
      ),
    )();
  });

  it("should not update the document when it has a lower timestamp than the one in the index", async () => {
    const [olderDocument, newerDocument] = [getOlderDocument(), getNewerDocument()]
    await pipe(
      E.Do,
      E.bind("service", () => getElasticSearchService(ELASTIC_NODE)),
      E.bind("strategy", () =>
        E.tryCatch(
          () => getDeduplicationStrategy(tableDeduplicationStrategyConfig),
          E.toError,
        ),
      ),
      TE.fromEither,
      TE.chainFirst(({ service, strategy }) =>
        strategy.execute(INDEX_NAME, olderDocument)(service),
      ),
      TE.bimap(
        (err) =>
          new Error(
            `it should not fail while finding an existing index - ${err.message}`,
          ),
        ({ service }) =>
          pipe(
            service.get(INDEX_NAME, olderDocument),
            defaultLog.taskEither.info((doc) => `Doc retrieved ${doc._source}`),
            TE.bimap(E.toError, (doc) =>
              expect(doc._source).toEqual(newerDocument),
            ),
          ),
      ),
    )();
  });
});
