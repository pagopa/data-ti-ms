import { TableClient } from "@azure/data-tables";
import * as EL from "@elastic/elasticsearch";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as tableUtils from "../../utils/tableStorage";
import * as elasticUtils from "../elasticsearch/elasticsearch";

import { pipe } from "fp-ts/lib/function";
import { IOutputDocument } from "../elasticsearch/elasticsearch";
import { tableStorageDeduplication } from "../tablestorage-deduplication";

const mockTableClient = {} as TableClient;
const mockElasticClient = {} as EL.Client;

const getTableDocumentSpy = jest.spyOn(tableUtils, "getTableDocument");
const upsertTableDocumentSpy = jest.spyOn(tableUtils, "upsertTableDocument");
const indexDocumentSpy = jest.spyOn(elasticUtils, "indexDocument");
const updateIndexDocumentSpy = jest.spyOn(elasticUtils, "updateIndexDocument");

describe("tableStorageDeduplication", () => {
  const mockDocument: IOutputDocument = {
    id: "testId",
    _timestamp: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should index a new document and store it in table if document does not exist", async () => {
    getTableDocumentSpy.mockImplementationOnce(() => TE.right(O.none));
    indexDocumentSpy.mockImplementationOnce(() => () => TE.right(void 0));
    upsertTableDocumentSpy.mockImplementationOnce(() => TE.right(void 0));

    await pipe(
      tableStorageDeduplication(
        mockElasticClient,
        mockTableClient,
        "testIndex"
      )(mockDocument),
      TE.bimap(
        () => {
          throw new Error("it should not fail");
        },
        result => {
          expect(result).toEqual(void 0);
          expect(getTableDocumentSpy).toHaveBeenCalledWith(
            mockTableClient,
            "testIndex",
            "testId"
          );
          expect(indexDocumentSpy).toHaveBeenCalledWith(mockElasticClient);
          expect(upsertTableDocumentSpy).toHaveBeenCalledWith(mockTableClient, {
            rowKey: "testId",
            partitionKey: "testIndex",
            id: "testId"
          });
        }
      )
    )();
  });

  it("should update existing document in index and store it in table if document already exists", async () => {
    getTableDocumentSpy.mockImplementationOnce(() =>
      TE.right(O.some({} as Record<string, unknown>))
    );
    updateIndexDocumentSpy.mockImplementationOnce(() => () => TE.right(void 0));
    upsertTableDocumentSpy.mockImplementationOnce(() => TE.right(void 0));

    await pipe(
      tableStorageDeduplication(
        mockElasticClient,
        mockTableClient,
        "testIndex"
      )(mockDocument),
      TE.bimap(
        () => {
          throw new Error("it should not fail");
        },
        result => {
          expect(result).toEqual(void 0);
          expect(getTableDocumentSpy).toHaveBeenCalledWith(
            mockTableClient,
            "testIndex",
            "testId"
          );
          expect(updateIndexDocumentSpy).toHaveBeenCalledWith(
            mockElasticClient
          );
          expect(upsertTableDocumentSpy).toHaveBeenCalledWith(mockTableClient, {
            rowKey: "testId",
            partitionKey: "testIndex",
            id: "testId"
          });
        }
      )
    )();
  });

  it("should handle error when getting document from table", async () => {
    getTableDocumentSpy.mockImplementationOnce(() =>
      TE.left(new Error("Failed to get document"))
    );

    await pipe(
      tableStorageDeduplication(
        mockElasticClient,
        mockTableClient,
        "testIndex"
      )(mockDocument),
      TE.bimap(
        result => {
          expect(result).toEqual(new Error("Failed to get document"));
          expect(getTableDocumentSpy).toHaveBeenCalledWith(
            mockTableClient,
            "testIndex",
            "testId"
          );
          expect(indexDocumentSpy).not.toHaveBeenCalled();
          expect(updateIndexDocumentSpy).not.toHaveBeenCalled();
          expect(upsertTableDocumentSpy).not.toHaveBeenCalled();
        },
        () => {
          throw new Error("it should not fail");
        }
      )
    )();
  });

  it("should handle error when indexing document", async () => {
    getTableDocumentSpy.mockImplementationOnce(() => TE.right(O.none));
    indexDocumentSpy.mockImplementationOnce(() => () =>
      TE.left(new Error("Failed to index document"))
    );

    await pipe(
      tableStorageDeduplication(
        mockElasticClient,
        mockTableClient,
        "testIndex"
      )(mockDocument),
      TE.bimap(
        result => {
          expect(result).toEqual(new Error("Failed to index document"));
          expect(getTableDocumentSpy).toHaveBeenCalledWith(
            mockTableClient,
            "testIndex",
            "testId"
          );
          expect(indexDocumentSpy).toHaveBeenCalledWith(mockElasticClient);
          expect(updateIndexDocumentSpy).not.toHaveBeenCalled();
          expect(upsertTableDocumentSpy).not.toHaveBeenCalled();
        },
        () => {
          throw new Error("it should not fail");
        }
      )
    )();
  });

  it("should handle error when updating document index", async () => {
    getTableDocumentSpy.mockImplementationOnce(() =>
      TE.right(O.some({} as Record<string, unknown>))
    );
    updateIndexDocumentSpy.mockImplementationOnce(() => () =>
      TE.left(new Error("Failed to update the document index"))
    );

    await pipe(
      tableStorageDeduplication(
        mockElasticClient,
        mockTableClient,
        "testIndex"
      )(mockDocument),
      TE.bimap(
        result => {
          expect(result).toEqual(
            new Error("Failed to update the document index")
          );
          expect(getTableDocumentSpy).toHaveBeenCalledWith(
            mockTableClient,
            "testIndex",
            "testId"
          );
          expect(updateIndexDocumentSpy).toHaveBeenCalledWith(
            mockElasticClient
          );
          expect(indexDocumentSpy).not.toHaveBeenCalled();
          expect(upsertTableDocumentSpy).not.toHaveBeenCalled();
        },
        () => {
          throw new Error("it should not fail");
        }
      )
    )();
  });

  it("should handle error when upserting on table storage", async () => {
    getTableDocumentSpy.mockImplementationOnce(() =>
      TE.right(O.some({} as Record<string, unknown>))
    );

    updateIndexDocumentSpy.mockImplementationOnce(() => () => TE.right(void 0));
    upsertTableDocumentSpy.mockImplementationOnce(() =>
      TE.left(new Error("Failed to insert on table storage"))
    );

    await pipe(
      tableStorageDeduplication(
        mockElasticClient,
        mockTableClient,
        "testIndex"
      )(mockDocument),
      TE.bimap(
        result => {
          expect(result).toEqual(
            new Error("Failed to insert on table storage")
          );
          expect(getTableDocumentSpy).toHaveBeenCalledWith(
            mockTableClient,
            "testIndex",
            "testId"
          );
          expect(updateIndexDocumentSpy).toHaveBeenCalledWith(
            mockElasticClient
          );
          expect(indexDocumentSpy).not.toHaveBeenCalled();
          expect(upsertTableDocumentSpy).toHaveBeenCalledWith(mockTableClient, {
            rowKey: "testId",
            partitionKey: "testIndex",
            id: "testId"
          });
        },
        () => {
          throw new Error("it should not fail");
        }
      )
    )();
  });
});
