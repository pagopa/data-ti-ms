/* eslint-disable no-var */
import * as E from "fp-ts/Either";
import * as EventHubUtils from "../utils";

var mockConsumerFn = jest.fn();

jest.mock("kafkajs", () => ({
  ...jest.requireActual("kafkajs"),
  Kafka: jest.fn(() => ({
    consumer: mockConsumerFn
  }))
}));

const DUMMY_SAS = {
  key: "dummykeytp5bIGW+QCTtGh8RIpcOCHg2CfJU7ij1uQmA=",
  name: "dummy-name",
  policy: "dummy-policy",
  url: "dummy.servicebus.windows.net"
};
const DUMMY_CONNECTION_STRING = `Endpoint=sb://${DUMMY_SAS.url}/;SharedAccessKeyName=${DUMMY_SAS.policy};SharedAccessKey=${DUMMY_SAS.key};EntityPath=${DUMMY_SAS.name}`;

describe("getEventHubConsumer", () => {
  it("should return a KafkaConsumerCompact on successful decoding", () => {
    const result = EventHubUtils.getEventHubConsumer(DUMMY_CONNECTION_STRING);

    expect(E.isRight(result)).toBe(true);
  });

  it("should return an Either with an error on decoding failure", () => {
    const invalidConnectionString =
      "DefaultEndpointsProtocol=https;AccountName=dummy;AccountKey=key;EndpointSuffix=core.windows.net";

    const result = EventHubUtils.getEventHubConsumer(invalidConnectionString);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toEqual(
        new Error("Error during decoding Event Hub SAS")
      );
    }
  });
});
