import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/lib/function";
import { IOutputDocument } from "../elasticsearch/elasticsearch";
import { IOutputService } from "../elasticsearch/service";
import { indexerDeduplication } from "../indexer-deduplication";

const mockGet = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

const mockService: IOutputService = {
  get: mockGet,
  insert: mockInsert,
  update: mockUpdate
};

const indexName = "test_index";
const document: IOutputDocument = {
  id: "123",
  key1: "value1",
  key2: "value2",
  _timestamp: 10
};

describe("indexerDeduplication", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("indexerDeduplication should insert while retrieving a document (404 error)", async () => {
    mockGet.mockImplementationOnce(() => TE.left({ statusCode: 404 }));
    mockInsert.mockImplementationOnce(() => TE.right(constVoid));
    await pipe(
      indexerDeduplication(indexName, document)(mockService),
      TE.bimap(
        () => {
          throw new Error(
            `it should not fail while retrieving a document (404 error)`
          );
        },
        _ => {
          expect(mockGet).toHaveBeenCalledWith(indexName, document);
          expect(mockInsert).toHaveBeenCalledWith(indexName, document);
          expect(mockUpdate).not.toHaveBeenCalled();
        }
      )
    )();
  });

  it("indexerDeduplication should do nothing while retrieving a document (500 error)", async () => {
    mockGet.mockImplementationOnce(() => TE.left({ statusCode: 500 }));
    await pipe(
      indexerDeduplication(indexName, document)(mockService),
      TE.bimap(
        err => {
          expect(mockGet).toHaveBeenCalledWith(indexName, document);
          expect(mockUpdate).not.toHaveBeenCalled();
          expect(mockInsert).not.toHaveBeenCalled();
          expect(err).toEqual(
            new Error(
              `Error while getting document from index - ${JSON.stringify({
                statusCode: 500
              })}`
            )
          );
        },
        () => {
          throw new Error(
            `it should fail while retrieving a document (404 error)`
          );
        }
      )
    )();
  });

  it("indexerDeduplication should do nothing while retrieving a document with a greater timestamp", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right({ _source: { _timestamp: 123 } })
    );
    await pipe(
      indexerDeduplication(indexName, document)(mockService),
      TE.bimap(
        () => {
          throw new Error(
            `it should not fail while retrieving a document (404 error)`
          );
        },
        _ => {
          expect(mockGet).toHaveBeenCalledWith(indexName, document);
          expect(mockUpdate).not.toHaveBeenCalled();
          expect(mockInsert).not.toHaveBeenCalled();
        }
      )
    )();
  });

  it("indexerDeduplication should update the index while retrieving a document with a lower timestamp", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right({ _source: { _timestamp: 1 } })
    );
    mockUpdate.mockImplementationOnce(() => TE.right(constVoid));

    await pipe(
      indexerDeduplication(indexName, document)(mockService),
      TE.bimap(
        () => {
          throw new Error(
            `it should not fail while retrieving a document (404 error)`
          );
        },
        _ => {
          expect(mockGet).toHaveBeenCalledWith(indexName, document);
          expect(mockUpdate).toHaveBeenCalledWith(indexName, document);
          expect(mockInsert).not.toHaveBeenCalled();
        }
      )
    )();
  });

  it("indexerDeduplication should do nothing while retrieving a document without the _source fields", async () => {
    mockGet.mockImplementationOnce(() => TE.right({}));
    await pipe(
      indexerDeduplication(indexName, document)(mockService),
      TE.bimap(
        () => {
          throw new Error(
            `it should not fail while retrieving a document (404 error)`
          );
        },
        _ => {
          expect(mockGet).toHaveBeenCalledWith(indexName, document);
          expect(mockUpdate).not.toHaveBeenCalled();
          expect(mockInsert).not.toHaveBeenCalled();
        }
      )
    )();
  });

  it("indexerDeduplication should return an error when an error occurs during the update", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right({ _source: { _timestamp: 1 } })
    );
    mockUpdate.mockImplementationOnce(() =>
      TE.left(new Error("Error during update"))
    );
    await pipe(
      indexerDeduplication(indexName, document)(mockService),
      TE.bimap(
        err => {
          expect(mockGet).toHaveBeenCalledWith(indexName, document);
          expect(mockUpdate).toHaveBeenCalledWith(indexName, document);
          expect(mockInsert).not.toHaveBeenCalled();
          expect(err).toEqual(new Error("Error during update"));
        },
        _ => {
          throw new Error(
            `it should not fail while retrieving a document (404 error)`
          );
        }
      )
    )();
  });

  it("indexerDeduplication should return an error when an error occurs during the get", async () => {
    mockGet.mockImplementationOnce(() => TE.left({ statusCode: 404 }));
    mockInsert.mockImplementationOnce(() => TE.left(new Error()));
    await pipe(
      indexerDeduplication(indexName, document)(mockService),
      TE.bimap(
        err => {
          expect(mockGet).toHaveBeenCalledWith(indexName, document);
          expect(mockUpdate).not.toHaveBeenCalled();
          expect(mockInsert).toHaveBeenCalledWith(indexName, document);
          expect(err).toEqual(
            new Error("Error during the insert of the document")
          );
        },
        _ => {
          throw new Error(
            `it should not fail while retrieving a document (404 error)`
          );
        }
      )
    )();
  });
});
