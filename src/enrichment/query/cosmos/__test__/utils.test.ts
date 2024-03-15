/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable extra-rules/no-commented-out-code */
import { CosmosClient, Items } from "@azure/cosmos";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { findByKey, findLastVersionByKey, getQuery } from "../utils";
import {
  IKeyQueryEnrichmentParams,
  IVersionedQueryEnrichmentParams
} from "../../../../utils/types";
const containerName = "containerId";
const databaseName = "dbId";
const idFieldValue = "itemId";
const partitionKeyFieldValue = "partitionKeyValue";
const partitionKeyFieldName = "partitionKeyName";
const itemReadMock = jest.fn().mockResolvedValue({ resource: { id: "id" } });

const itemFetchAll = jest.fn().mockResolvedValue({ resources: [{ id: "id" }] });
const itemQueryMock = jest.fn().mockReturnValue({
  fetchAll: itemFetchAll
});

const mockItem = jest.fn().mockReturnValue({
  read: itemReadMock
});

const mockItems: Items = ({
  query: itemQueryMock
} as unknown) as Items;

const mockContainer = jest.fn().mockReturnValue({
  item: mockItem,
  items: mockItems
});
const mockDatabase = jest.fn().mockReturnValue({
  container: mockContainer
});

const mockClient: CosmosClient = ({
  database: mockDatabase
} as unknown) as CosmosClient;

const findByKeyParams: IKeyQueryEnrichmentParams<Record<string, unknown>> = {
  containerName,
  databaseName,
  idFieldValue,
  partitionKeyFieldValue
};

describe("findByKey", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  it("should return Some(unknown) when the item is found", async () => {
    const resultPartitionKey = await findByKey(mockClient)(findByKeyParams)();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(idFieldValue, partitionKeyFieldValue);
    expect(resultPartitionKey).toEqual(E.right(O.some({ id: "id" })));
  });

  it("should return an error when  an error occurs", async () => {
    mockDatabase.mockImplementationOnce(() => {
      throw Error("Error while getting database");
    });

    const result = await findByKey(mockClient)(findByKeyParams)();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(result).toEqual(
      E.left(
        new Error(
          `Impossible to get item ${idFieldValue} from container ${containerName}`
        )
      )
    );

    mockContainer.mockImplementationOnce(() => {
      throw Error("Error while getting container");
    });

    const resultContainer = await findByKey(mockClient)(findByKeyParams)();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(resultContainer).toEqual(
      E.left(
        new Error(
          `Impossible to get item ${idFieldValue} from container ${containerName}`
        )
      )
    );

    mockItem.mockImplementationOnce(() => {
      throw Error("Error while getting container");
    });

    const itemContainer = await findByKey(mockClient)(findByKeyParams)();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(idFieldValue, partitionKeyFieldValue);

    expect(itemContainer).toEqual(
      E.left(
        new Error(
          `Impossible to get item ${idFieldValue} from container ${containerName}`
        )
      )
    );
  });

  it("should return None when the item is not found", async () => {
    itemReadMock.mockResolvedValueOnce({
      resource:
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        undefined
    });
    const result = await findByKey(mockClient)(findByKeyParams)();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(idFieldValue, partitionKeyFieldValue);
    expect(result).toEqual(E.right(O.none));

    itemReadMock.mockResolvedValueOnce({
      resource:
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        undefined
    });

    const resultPartitionKey = await findByKey(mockClient)(findByKeyParams)();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(idFieldValue, partitionKeyFieldValue);
    expect(resultPartitionKey).toEqual(E.right(O.none));
  });
});

const versionFieldName = "versionFieldName";
const findLastVersionParams: IVersionedQueryEnrichmentParams<Record<
  string,
  unknown
>> = {
  containerName,
  databaseName,
  idFieldValue,
  partitionKeyFieldName,
  partitionKeyFieldValue,
  versionFieldName
};

describe("findLastVersionByKey", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should return Some(unknown) when the item is found", async () => {
    const resultPartitionKey = await findLastVersionByKey(mockClient)(
      findLastVersionParams
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(itemQueryMock).toHaveBeenCalledWith(
      getQuery(
        containerName,
        idFieldValue,
        versionFieldName,
        partitionKeyFieldName,
        partitionKeyFieldValue
      )
    );
    expect(resultPartitionKey).toEqual(E.right(O.some({ id: "id" })));
  });

  it("should return an error when an error occurs", async () => {
    mockDatabase.mockImplementationOnce(() => {
      throw Error("Error while getting database");
    });

    const result = await findLastVersionByKey(mockClient)(
      findLastVersionParams
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(result).toEqual(
      E.left(
        new Error(
          `Impossible to get last version of the item ${idFieldValue} from container ${containerName}`
        )
      )
    );

    mockContainer.mockImplementationOnce(() => {
      throw Error("Error while getting container");
    });

    const resultContainer = await findLastVersionByKey(mockClient)(
      findLastVersionParams
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(resultContainer).toEqual(
      E.left(
        new Error(
          `Impossible to get last version of the item ${idFieldValue} from container ${containerName}`
        )
      )
    );

    itemQueryMock.mockImplementationOnce(() => {
      throw Error("Error while getting container");
    });

    const itemContainer = await findLastVersionByKey(mockClient)(
      findLastVersionParams
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(itemQueryMock).toHaveBeenCalledWith(
      getQuery(
        containerName,
        idFieldValue,
        versionFieldName,
        partitionKeyFieldName,
        partitionKeyFieldValue
      )
    );

    expect(itemContainer).toEqual(
      E.left(
        new Error(
          `Impossible to get last version of the item ${idFieldValue} from container ${containerName}`
        )
      )
    );
  });

  it("should return None when the item is not found", async () => {
    itemFetchAll.mockResolvedValueOnce({
      resources: []
    });

    const result = await findLastVersionByKey(mockClient)(
      findLastVersionParams
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(itemQueryMock).toHaveBeenCalledWith(
      getQuery(
        containerName,
        idFieldValue,
        versionFieldName,
        partitionKeyFieldName,
        partitionKeyFieldValue
      )
    );
    expect(result).toEqual(E.right(O.none));
  });
});
