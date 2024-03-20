/* eslint-disable @typescript-eslint/no-explicit-any */
import * as KafkaConsumerUtils from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import { KafkaConsumerCompact } from "@pagopa/fp-ts-kafkajs/dist/lib/KafkaConsumerCompact";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as EventHubUtils from "../eventhub/utils";
import { createEventHubService, createNativeEventHubService } from "../service";

const getEventHubConsumerSpy = jest
  .spyOn(EventHubUtils, "getEventHubConsumer")
  .mockReturnValue(E.right({} as KafkaConsumerCompact));

const nativeConsumerMock = {
  subscribe: jest.fn()
} as any;
const getNativeEventHubConsumerSpy = jest
  .spyOn(EventHubUtils, "getNativeEventHubConsumer")
  .mockReturnValue(E.right(nativeConsumerMock));
const readMessageSpy = jest.spyOn(KafkaConsumerUtils, "read");
const connectionString = "your_connection_string";
const mockError = new Error("Failed to get event hub consumer");
const mockMessageHandler = jest.fn().mockImplementation(() => TE.of(void 0));
describe("EventHubService", () => {
  it("should create EventHubService", async () => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    readMessageSpy.mockImplementationOnce(_ => () => TE.right(void 0));

    const result = createEventHubService({
      connectionString,
      queueType: "BASIC_KAFKA"
    } as any)(mockMessageHandler);

    expect(getEventHubConsumerSpy).toHaveBeenCalledWith(connectionString);
    expect(result).toEqual(
      E.right(expect.objectContaining({ consumeMessage: expect.any(Function) }))
    );
  });

  it("should return an error when getEventHubConsumer fails", async () => {
    getEventHubConsumerSpy.mockImplementationOnce(() => E.left(mockError));

    const result = createEventHubService({
      connectionString,
      queueType: "BASIC_KAFKA"
    } as any)(mockMessageHandler);

    expect(getEventHubConsumerSpy).toHaveBeenCalledWith(connectionString);
    expect(result).toEqual(E.left(mockError));
  });
});

describe("NativeEventHubService", () => {
  it("should create NativeEventHubService", async () => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    readMessageSpy.mockImplementationOnce(_ => () => TE.right(void 0));

    const result = createNativeEventHubService({
      connectionString,
      queueType: "NATIVE_EVH"
    })(mockMessageHandler);

    expect(getNativeEventHubConsumerSpy).toHaveBeenCalledWith(connectionString);
    expect(result).toEqual(
      E.right(expect.objectContaining({ consumeMessage: expect.any(Function) }))
    );
  });

  it("should return an error when getNativeEventHubConsumer fails", async () => {
    getNativeEventHubConsumerSpy.mockImplementationOnce(() =>
      E.left(mockError)
    );

    const result = createNativeEventHubService({
      connectionString,
      queueType: "NATIVE_EVH"
    } as any)(mockMessageHandler);

    expect(getNativeEventHubConsumerSpy).toHaveBeenCalledWith(connectionString);
    expect(result).toEqual(E.left(mockError));
  });
});
