import * as E from "fp-ts/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { constVoid, pipe } from "fp-ts/lib/function";
import {
  createIndexIfNotExists,
  getElasticClient,
} from "../../../../src/deduplication/elasticsearch/elasticsearch";
import { getElasticSearchService } from "../../../../src/deduplication/elasticsearch/service";
import {
  DeduplicationStrategyType,
  getDeduplicationStrategy,
} from "../../../../src/deduplication/factory";
import { ELASTIC_NODE } from "../../../env";

const INDEX_NAME = "index_name";
const ID = "id";
beforeAll(async () => {
  await pipe(
    getElasticClient(ELASTIC_NODE),
    TE.fromEither,
    TE.chain((client) => createIndexIfNotExists(client, INDEX_NAME)),
    TE.getOrElse((e) => {
      throw Error(
        `Cannot initialize integration tests - ${JSON.stringify(e.message)}`,
      );
    }),
  )();
}, 10000);

describe("deduplication", () => {
  it("should create the index when it doesn't exists", async () => {
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
        strategy.execute(INDEX_NAME, {
          id: ID,
          _timestamp: Date.now(),
        })(service),
      ),
      TE.bimap(
        (err) =>
          new Error(
            `it should not fail while finding an existing index - ${err.message}`,
          ),
        () => constVoid(),
      ),
    )();
  });
});
