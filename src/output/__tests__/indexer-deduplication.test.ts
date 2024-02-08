import * as EL from "@elastic/elasticsearch";
import { GetResponse } from "@elastic/elasticsearch/lib/api/types";
import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/lib/function";
import { IOutputDocument } from "../elasticsearch/elasticsearch";
import { IOutputDeduplicationService } from "../elasticsearch/service";
import { indexerDeduplication } from "../indexer-deduplication";

const mockGet = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

const mockService: IOutputDeduplicationService = {
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
    mockGet.mockImplementationOnce(() =>
      TE.left({ statusCode: 404 } as EL.errors.ResponseError)
    );
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
    mockGet.mockImplementationOnce(() =>
      TE.left({ statusCode: 500 } as EL.errors.ResponseError)
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

  it("indexerDeduplication should do nothing while retrieving a document with a greater timestamp", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right(({ _source: { _timestamp: 123 } } as unknown) as GetResponse)
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

  it("indexerDeduplication should update index while retrieving a document with a lower timestamp", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right(({ _source: { _timestamp: 1 } } as unknown) as GetResponse)
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

  it("indexerDeduplication should return an error when an error occurs", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right(({ _source: { _timestamp: 1 } } as unknown) as GetResponse)
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
});
