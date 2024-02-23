import { TableClient } from "@azure/data-tables";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as tableUtils from "../../utils/tableStorage";

import { pipe } from "fp-ts/lib/function";
import { IOutputDocument } from "../elasticsearch/elasticsearch";
import { IOutputDeduplicationService } from "../elasticsearch/service";
import { tableStorageDeduplication } from "../tablestorage-deduplication";

const mockTableClient = {} as TableClient;

const mockGet = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

const mockService: IOutputDeduplicationService = {
  get: mockGet,
  insert: mockInsert,
  update: mockUpdate
};

const getTableClient = jest.spyOn(tableUtils, "getTableClient");
const getTableDocumentSpy = jest.spyOn(tableUtils, "getTableDocument");
const upsertTableDocumentSpy = jest.spyOn(tableUtils, "upsertTableDocument");

describe("tableStorageDeduplication", () => {
  const mockDocument: IOutputDocument = {
    id: "testId",
    _timestamp: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should index a new document and store it in table if document does not exist", async () => {
    getTableClient.mockImplementationOnce(() => () => mockTableClient);
    getTableDocumentSpy.mockImplementationOnce(() => TE.right(O.none));
    mockInsert.mockImplementationOnce(() => TE.right(void 0));
    upsertTableDocumentSpy.mockImplementationOnce(() => TE.right(void 0));

    await pipe(
      tableStorageDeduplication("testIndex", mockDocument)(mockService),
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
          expect(mockInsert).toHaveBeenCalledWith("testIndex", mockDocument);
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
    getTableClient.mockImplementationOnce(() => () => mockTableClient);
    getTableDocumentSpy.mockImplementationOnce(() =>
      TE.right(O.some({} as Record<string, unknown>))
    );
    mockUpdate.mockImplementationOnce(() => TE.right(void 0));
    upsertTableDocumentSpy.mockImplementationOnce(() => TE.right(void 0));

    await pipe(
      tableStorageDeduplication("testIndex", mockDocument)(mockService),
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
          expect(mockUpdate).toHaveBeenCalledWith("testIndex", mockDocument);
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
    getTableClient.mockImplementationOnce(() => () => mockTableClient);
    getTableDocumentSpy.mockImplementationOnce(() =>
      TE.left(new Error("Failed to get document"))
    );

    await pipe(
      tableStorageDeduplication("testIndex", mockDocument)(mockService),
      TE.bimap(
        result => {
          expect(result).toEqual(new Error("Failed to get document"));
          expect(getTableDocumentSpy).toHaveBeenCalledWith(
            mockTableClient,
            "testIndex",
            "testId"
          );
          expect(mockInsert).not.toHaveBeenCalled();
          expect(mockUpdate).not.toHaveBeenCalled();
          expect(upsertTableDocumentSpy).not.toHaveBeenCalled();
        },
        () => {
          throw new Error("it should not fail");
        }
      )
    )();
  });

  it("should handle error when indexing document", async () => {
    getTableClient.mockImplementationOnce(() => () => mockTableClient);
    getTableDocumentSpy.mockImplementationOnce(() => TE.right(O.none));
    mockInsert.mockImplementationOnce(() =>
      TE.left(new Error("Failed to index document"))
    );

    await pipe(
      tableStorageDeduplication("testIndex", mockDocument)(mockService),
      TE.bimap(
        result => {
          expect(result).toEqual(new Error("Failed to index document"));
          expect(getTableDocumentSpy).toHaveBeenCalledWith(
            mockTableClient,
            "testIndex",
            "testId"
          );
          expect(mockInsert).toHaveBeenCalledWith("testIndex", mockDocument);
          expect(mockUpdate).not.toHaveBeenCalled();
          expect(upsertTableDocumentSpy).not.toHaveBeenCalled();
        },
        err => {
          throw new Error("it should not fail");
        }
      )
    )();
  });

  it("should handle error when updating document index", async () => {
    getTableClient.mockImplementationOnce(() => () => mockTableClient);
    getTableDocumentSpy.mockImplementationOnce(() =>
      TE.right(O.some({} as Record<string, unknown>))
    );
    mockUpdate.mockImplementationOnce(() =>
      TE.left(new Error("Failed to update the document index"))
    );

    await pipe(
      tableStorageDeduplication("testIndex", mockDocument)(mockService),
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
          expect(mockUpdate).toHaveBeenCalledWith("testIndex", mockDocument);
          expect(mockInsert).not.toHaveBeenCalled();
          expect(upsertTableDocumentSpy).not.toHaveBeenCalled();
        },
        () => {
          throw new Error("it should not fail");
        }
      )
    )();
  });

  it("should handle error when upserting on table storage", async () => {
    getTableClient.mockImplementationOnce(() => () => mockTableClient);
    getTableDocumentSpy.mockImplementationOnce(() =>
      TE.right(O.some({} as Record<string, unknown>))
    );
    mockUpdate.mockImplementationOnce(() => TE.right(void 0));
    upsertTableDocumentSpy.mockImplementationOnce(() =>
      TE.left(new Error("Failed to insert on table storage"))
    );

    await pipe(
      tableStorageDeduplication("testIndex", mockDocument)(mockService),
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
          expect(mockUpdate).toHaveBeenCalledWith("testIndex", mockDocument);
          expect(mockInsert).not.toHaveBeenCalled();
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
