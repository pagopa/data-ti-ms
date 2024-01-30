/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable extra-rules/no-commented-out-code */
import { CosmosClient, Items } from "@azure/cosmos";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { findByKey, findLastVersionByKey, getQuery } from "../utils";
const containerName = "containerId";
const databaseName = "dbId";
const itemId = "itemId";
const partitionKey = "partitionKey";

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

describe("findByKey", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  it("should return Some(unknown) when the item is found", async () => {
    const result = await findByKey(
      mockClient,
      databaseName,
      containerName,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(itemId, undefined);
    expect(result).toEqual(E.right(O.some({ id: "id" })));

    const resultPartitionKey = await findByKey(
      mockClient,
      databaseName,
      containerName,
      itemId,
      partitionKey
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(itemId, partitionKey);
    expect(resultPartitionKey).toEqual(E.right(O.some({ id: "id" })));
  });

  it("should return an error when  an error occurs", async () => {
    mockDatabase.mockImplementationOnce(() => {
      throw Error("Error while getting database");
    });

    const result = await findByKey(
      mockClient,
      databaseName,
      containerName,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(result).toEqual(
      E.left(
        new Error(
          `Impossible to get item ${itemId} from container ${containerName}`
        )
      )
    );

    mockContainer.mockImplementationOnce(() => {
      throw Error("Error while getting container");
    });

    const resultContainer = await findByKey(
      mockClient,
      databaseName,
      containerName,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(resultContainer).toEqual(
      E.left(
        new Error(
          `Impossible to get item ${itemId} from container ${containerName}`
        )
      )
    );

    mockItem.mockImplementationOnce(() => {
      throw Error("Error while getting container");
    });

    const itemContainer = await findByKey(
      mockClient,
      databaseName,
      containerName,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(itemId, undefined);

    expect(itemContainer).toEqual(
      E.left(
        new Error(
          `Impossible to get item ${itemId} from container ${containerName}`
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
    const result = await findByKey(
      mockClient,
      databaseName,
      containerName,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(itemId, undefined);
    expect(result).toEqual(E.right(O.none));

    itemReadMock.mockResolvedValueOnce({
      resource:
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        undefined
    });

    const resultPartitionKey = await findByKey(
      mockClient,
      databaseName,
      containerName,
      itemId,
      partitionKey
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(mockItem).toHaveBeenCalledWith(itemId, partitionKey);
    expect(resultPartitionKey).toEqual(E.right(O.none));
  });
});

const versionFieldName = "versionFieldName";
const versionFieldValue = "versionFieldValue";

describe("findLastVersionByKey", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should return Some(unknown) when the item is found", async () => {
    const result = await findLastVersionByKey(
      mockClient,
      databaseName,
      containerName,
      versionFieldName,
      versionFieldValue,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(itemQueryMock).toHaveBeenCalledWith(
      getQuery(containerName, itemId, versionFieldName, versionFieldValue)
    );
    expect(result).toEqual(E.right([{ id: "id" }]));

    const resultPartitionKey = await findLastVersionByKey(
      mockClient,
      databaseName,
      containerName,
      versionFieldName,
      versionFieldValue,
      itemId,
      partitionKey
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(itemQueryMock).toHaveBeenCalledWith(
      getQuery(
        containerName,
        itemId,
        versionFieldName,
        versionFieldValue,
        partitionKey
      )
    );
    expect(resultPartitionKey).toEqual(E.right([{ id: "id" }]));
  });

  it("should return an error when an error occurs", async () => {
    mockDatabase.mockImplementationOnce(() => {
      throw Error("Error while getting database");
    });

    const result = await findLastVersionByKey(
      mockClient,
      databaseName,
      containerName,
      versionFieldName,
      versionFieldValue,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(result).toEqual(
      E.left(
        new Error(
          `Impossible to get last version of the item ${itemId} from container ${containerName}`
        )
      )
    );

    mockContainer.mockImplementationOnce(() => {
      throw Error("Error while getting container");
    });

    const resultContainer = await findLastVersionByKey(
      mockClient,
      databaseName,
      containerName,
      versionFieldName,
      versionFieldValue,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(resultContainer).toEqual(
      E.left(
        new Error(
          `Impossible to get last version of the item ${itemId} from container ${containerName}`
        )
      )
    );

    itemQueryMock.mockImplementationOnce(() => {
      throw Error("Error while getting container");
    });

    const itemContainer = await findLastVersionByKey(
      mockClient,
      databaseName,
      containerName,
      versionFieldName,
      versionFieldValue,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(itemQueryMock).toHaveBeenCalledWith(
      getQuery(containerName, itemId, versionFieldName, versionFieldValue)
    );

    expect(itemContainer).toEqual(
      E.left(
        new Error(
          `Impossible to get last version of the item ${itemId} from container ${containerName}`
        )
      )
    );
  });

  it("should return None when the item is not found", async () => {
    itemFetchAll.mockResolvedValueOnce({
      resources: []
    });

    const result = await findLastVersionByKey(
      mockClient,
      databaseName,
      containerName,
      versionFieldName,
      versionFieldValue,
      itemId
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(itemQueryMock).toHaveBeenCalledWith(
      getQuery(containerName, itemId, versionFieldName, versionFieldValue)
    );
    expect(result).toEqual(E.right([]));

    itemFetchAll.mockResolvedValueOnce({
      resources: []
    });

    const resultPartitionKey = await findLastVersionByKey(
      mockClient,
      databaseName,
      containerName,
      versionFieldName,
      versionFieldValue,
      itemId,
      partitionKey
    )();

    expect(mockDatabase).toHaveBeenCalledWith(databaseName);
    expect(mockContainer).toHaveBeenCalledWith(containerName);
    expect(itemQueryMock).toHaveBeenCalledWith(
      getQuery(
        containerName,
        itemId,
        versionFieldName,
        versionFieldValue,
        partitionKey
      )
    );
    expect(resultPartitionKey).toEqual(E.right([]));
  });
});
