import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as EventHubUtils from "../eventhub/utils";
import { createEventHubService } from "../service";

jest.mock("../eventhub/utils");
const getEventHubConsumerSpy = jest.spyOn(EventHubUtils, "getEventHubConsumer");
const readMessageSpy = jest.spyOn(EventHubUtils, "readMessage");
const connectionString = "your_connection_string";
const mockError = new Error("Failed to get event hub consumer");
const mockConsumer = {} as EventHubUtils.KafkaConsumerCompact;
describe("EventHubService", () => {
  it("should create EventHubService", async () => {
    getEventHubConsumerSpy.mockImplementationOnce(() => E.right(mockConsumer));
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    readMessageSpy.mockImplementationOnce(_ => () => TE.right(void 0));

    const result = createEventHubService(connectionString);

    expect(getEventHubConsumerSpy).toHaveBeenCalledWith(connectionString);
    expect(result).toEqual(
      E.right(expect.objectContaining({ consumeMessage: expect.any(Function) }))
    );
  });

  it("should return an error when getEventHubConsumer fails", async () => {
    getEventHubConsumerSpy.mockImplementationOnce(() => E.left(mockError));

    const result = createEventHubService(connectionString);

    expect(getEventHubConsumerSpy).toHaveBeenCalledWith(connectionString);
    expect(result).toEqual(E.left(mockError));
  });
});
