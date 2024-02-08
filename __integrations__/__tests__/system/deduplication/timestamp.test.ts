import { defaultLog } from "@pagopa/winston-ts";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  createIndexIfNotExists,
  getElasticClient,
} from "../../../../src/output/elasticsearch/elasticsearch";
import { getElasticSearchService } from "../../../../src/output/elasticsearch/service";
import {
  DeduplicationStrategyType,
  getDeduplicationStrategy,
} from "../../../../src/output/factory";
import { ELASTIC_NODE } from "../../../env";
import { deleteData, deleteIndex } from "../../../utils/elasticsearch";

const INDEX_NAME = "index_name";
const FIRST_ID = "first_id";

const currentTimestamp = Date.now();
const oldTimestamp = new Date(currentTimestamp - 86400000).getTime();

const newerDocument = {
  id: FIRST_ID,
  _timestamp: currentTimestamp,
  value: "first",
};

const olderDocument = {
  id: FIRST_ID,
  _timestamp: oldTimestamp,
  value: "first",
};

beforeAll(async () => {
  await pipe(
    getElasticClient(ELASTIC_NODE),
    TE.fromEither,
    TE.chainFirst((client) => createIndexIfNotExists(client, INDEX_NAME)),
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
    TE.chainFirst((client) => deleteData(client, INDEX_NAME, FIRST_ID)),
    TE.chainFirst((client) => deleteIndex(client, INDEX_NAME)),
    TE.getOrElse((e) => {
      throw Error(
        `Cannot destroy integration tests data - ${JSON.stringify(e.message)}`,
      );
    }),
  )();
}, 10000);

describe("deduplication", () => {
  it("should create the document when it doesn't exists", async () => {
    await pipe(
      E.Do,
      E.bind("service", () => getElasticSearchService(ELASTIC_NODE)),
      E.bind("strategy", () =>
        E.tryCatch(
          () => getDeduplicationStrategy(DeduplicationStrategyType.Timestamp),
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
              expect(doc._source).toEqual(olderDocument),
            ),
          ),
      ),
    )();
  });

  it("should update the document when it has a greater timestamp than the one in the index", async () => {
    await pipe(
      E.Do,
      E.bind("service", () => getElasticSearchService(ELASTIC_NODE)),
      E.bind("strategy", () =>
        E.tryCatch(
          () => getDeduplicationStrategy(DeduplicationStrategyType.Timestamp),
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
    await pipe(
      E.Do,
      E.bind("service", () => getElasticSearchService(ELASTIC_NODE)),
      E.bind("strategy", () =>
        E.tryCatch(
          () => getDeduplicationStrategy(DeduplicationStrategyType.Timestamp),
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
