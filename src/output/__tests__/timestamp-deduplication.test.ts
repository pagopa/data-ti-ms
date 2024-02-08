import * as EL from "@elastic/elasticsearch";
import { GetResponse } from "@elastic/elasticsearch/lib/api/types";
import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/lib/function";
import { IOutputDocument } from "../elasticsearch/elasticsearch";
import { IOutputDeduplicationService } from "../elasticsearch/service";
import { timestampDeduplication } from "../timestamp-deduplication";

const mockGet = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

const mockService: IOutputDeduplicationService = {
  get: mockGet,
  insert: mockInsert,
  update: mockUpdate
};
const elasticNode = "http://localhost:9200";
const indexName = "test_index";
const document: IOutputDocument = {
  id: "123",
  key1: "value1",
  key2: "value2",
  _timestamp: 10
};

describe("timestampDeduplication", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("timestampDeduplication should insert while retrieving a document (404 error)", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.left({ statusCode: 404 } as EL.errors.ResponseError)
    );
    mockInsert.mockImplementationOnce(() => TE.right(constVoid));
    await pipe(
      timestampDeduplication(indexName, document)(mockService),
      TE.bimap(
        () => {
          new Error(
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

  it("timestampDeduplication should do nothing while retrieving a document (500 error)", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.left({ statusCode: 500 } as EL.errors.ResponseError)
    );
    await pipe(
      timestampDeduplication(indexName, document)(mockService),
      TE.bimap(
        () => {
          new Error(
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

  it("timestampDeduplication should do nothing while retrieving a document with a greater timestamp", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right(({ fields: { _timestamp: 123 } } as unknown) as GetResponse)
    );
    await pipe(
      timestampDeduplication(indexName, document)(mockService),
      TE.bimap(
        () => {
          new Error(
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

  it("timestampDeduplication should update index while retrieving a document with a lower timestamp", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right(({ fields: { _timestamp: 1 } } as unknown) as GetResponse)
    );
    await pipe(
      timestampDeduplication(indexName, document)(mockService),
      TE.bimap(
        () => {
          new Error(
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
  it("timestampDeduplication should return an error when an error occurs", async () => {
    mockGet.mockImplementationOnce(() =>
      TE.right(({ fields: { _timestamp: 1 } } as unknown) as GetResponse)
    );
    mockUpdate.mockImplementationOnce(() =>
      TE.left(new Error("Error during update"))
    );
    await pipe(
      timestampDeduplication(indexName, document)(mockService),
      TE.bimap(
        err => {
          expect(mockGet).toHaveBeenCalledWith(indexName, document);
          expect(mockUpdate).toHaveBeenCalledWith(indexName, document);
          expect(mockInsert).not.toHaveBeenCalled();
          expect(err).toEqual(new Error("Error during update"));
        },
        _ =>
          new Error(
            `it should not fail while retrieving a document (404 error)`
          )
      )
    )();
  });
});
