import * as EL from "@elastic/elasticsearch";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  IOutputDocument,
  createIndex,
  createIndexIfNotExists,
  getDocument,
  getElasticClient,
  indexDocument,
  updateIndexDocument
} from "../elasticsearch";

const mockCreate = jest.fn();
const mockExists = jest.fn();
const mockGet = jest.fn();
const mockIndex = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@elastic/elasticsearch", () => ({
  Client: jest.fn()
}));

const mockElasticClient: EL.Client = ({
  indices: {
    create: mockCreate,
    exists: mockExists
  },
  get: mockGet,
  index: mockIndex,
  update: mockUpdate
} as unknown) as EL.Client;

const elasticNode = "http://localhost:9200";
const indexName = "test_index";
const document: IOutputDocument = {
  id: "123",
  key1: "value1",
  key2: "value2"
};

describe("getElasticClient", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("getElasticClient should return an instance of Elasticsearch client", async () => {
    (EL.Client as jest.Mock).mockImplementationOnce(() => mockElasticClient);
    await pipe(
      getElasticClient(elasticNode),
      TE.bimap(
        () => {
          new Error(`it should not fail while finding an existing document`);
        },
        client => expect(client).toEqual(mockElasticClient)
      )
    )();
  });

  it("getElasticClient should return an error", async () => {
    (EL.Client as jest.Mock).mockImplementationOnce(
      () => new Error("Connection error")
    );
    await pipe(
      getElasticClient(elasticNode),
      TE.bimap(
        err => expect(err).toEqual(new Error("Connection error")),
        () => {
          new Error(`it should fail while finding an existing document`);
        }
      )
    )();
  });
});

describe("createIndex", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("createIndex should return true", async () => {
    mockCreate.mockResolvedValueOnce({
      acknowledged: true
    });
    await pipe(
      createIndex(mockElasticClient, indexName),
      TE.bimap(
        () => {
          new Error(`it should not fail while creating index`);
        },
        ack => expect(ack).toEqual(true)
      )
    )();
  });

  it("createIndex should return an error", async () => {
    mockCreate.mockResolvedValueOnce(new Error("Connection error"));
    await pipe(
      createIndex(mockElasticClient, indexName),
      TE.bimap(
        err => expect(err).toEqual(new Error("Connection error")),
        () => {
          new Error(`it should fail while finding an existing document`);
        }
      )
    )();
  });
});

describe("createIndexIfNotExists", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("createIndex should return true when the index does not exist", async () => {
    mockExists.mockResolvedValueOnce(false);
    mockCreate.mockResolvedValueOnce({
      acknowledged: true
    });
    await pipe(
      createIndexIfNotExists(mockElasticClient, indexName),
      TE.bimap(
        () => {
          new Error(`it should not fail while creating index`);
        },
        ack => expect(ack).toEqual(true)
      )
    )();
  });

  it("createIndex should return true when the index exist", async () => {
    mockExists.mockResolvedValueOnce(true);
    await pipe(
      createIndexIfNotExists(mockElasticClient, indexName),
      TE.bimap(
        () => {
          new Error(`it should not fail while creating index`);
        },
        ack => expect(ack).toEqual(true)
      )
    )();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("createIndex should return an error when creating", async () => {
    mockExists.mockResolvedValueOnce(false);
    mockCreate.mockResolvedValueOnce(new Error("Connection error"));
    await pipe(
      createIndexIfNotExists(mockElasticClient, indexName),
      TE.bimap(
        err => expect(err).toEqual(new Error("Connection error")),
        () => {
          new Error(`it should fail while finding an existing document`);
        }
      )
    )();
  });
});

describe("getDocument", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("getDocument should return succesfully a document", async () => {
    mockGet.mockResolvedValueOnce({
      id: document.id
    });
    await pipe(
      getDocument(mockElasticClient)(indexName, document),
      TE.bimap(
        () => {
          new Error(`it should not fail while creating index`);
        },
        doc =>
          expect(doc).toEqual({
            id: document.id
          })
      )
    )();
  });

  it("getDocument should return an error", async () => {
    mockGet.mockResolvedValueOnce(new Error("Error retrieving document"));
    await pipe(
      getDocument(mockElasticClient)(indexName, document),
      TE.bimap(
        err => expect(err).toEqual(new Error("Error retrieving document")),
        () => {
          new Error(`it should fail while finding an existing document`);
        }
      )
    )();
  });
});

describe("indexDocument", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("indexDocument should index succesfully a document", async () => {
    mockIndex.mockResolvedValueOnce({ result: "created" });
    await pipe(
      indexDocument(mockElasticClient)(indexName, document),
      TE.bimap(
        () => {
          new Error(`it should not fail while creating index`);
        },
        doc => expect(doc).toEqual("created")
      )
    )();
  });

  it("indexDocument should return an error", async () => {
    mockIndex.mockResolvedValueOnce(new Error("Error indexing document"));
    await pipe(
      indexDocument(mockElasticClient)(indexName, document),
      TE.bimap(
        err => expect(err).toEqual(new Error("Error indexing document")),
        () => {
          new Error(`it should fail while indexing a document`);
        }
      )
    )();
  });
});

describe("updateIndexDocument", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  it("updateIndexDocument should index succesfully a document", async () => {
    mockUpdate.mockResolvedValueOnce({ result: "created" });
    await pipe(
      updateIndexDocument(mockElasticClient)(indexName, document),
      TE.bimap(
        () => {
          new Error(`it should not fail while creating index`);
        },
        doc => expect(doc).toEqual("created")
      )
    )();
  });

  it("updateIndexDocument should return an error", async () => {
    mockUpdate.mockResolvedValueOnce(new Error("Error indexing document"));
    await pipe(
      updateIndexDocument(mockElasticClient)(indexName, document),
      TE.bimap(
        err => expect(err).toEqual(new Error("Error indexing document")),
        () => {
          new Error(`it should fail while indexing a document`);
        }
      )
    )();
  });
});
