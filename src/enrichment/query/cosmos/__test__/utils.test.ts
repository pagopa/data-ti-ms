/* eslint-disable extra-rules/no-commented-out-code */
import { CosmosClient } from "@azure/cosmos";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { findByKey } from "../utils";
const containerName = "containerId";
const databaseName = "dbId";
const itemId = "itemId";
const partitionKey = "partitionKey";

const itemReadMock = jest.fn().mockResolvedValue({ resource: { id: "id" } });

const mockItem = jest.fn().mockReturnValue({
  read: itemReadMock
});

const mockContainer = jest.fn().mockReturnValue({
  item: mockItem
});
const mockDatabase = jest.fn().mockReturnValue({
  container: mockContainer
});

const mockClient: CosmosClient = ({
  database: mockDatabase
} as unknown) as CosmosClient;

describe("findByKey", () => {
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
    itemReadMock.mockImplementationOnce(() => {
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        undefined;
      }
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
    expect(resultPartitionKey).toEqual(E.right(O.none));
  });
});
