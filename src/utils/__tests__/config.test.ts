import { Configuration } from "@pagopa/data-indexer-commons";
import { constructDataPipelineHandlers } from "../config";
import * as blobUtils from "../blobStorage";
import { selectFields } from "../../formatter/selectFields";

jest.spyOn(blobUtils, "getBlobContainerClient").mockReturnValue({} as any);

const config: Configuration = {
  dataPipelines: [
    {
      internalQueueTopicName: "topic",
      dataTransformation: [
        {
          dataMapping: [
            {
              type: "SELECT_INPUT",
              fields: ["foo", "bar"],
              mapper: "SELECT_FIELDS"
            },
            { type: "SINGLE_INPUT", mapper: "TRIM", inputFieldName: "baz" }
          ],
          dataEnrichment: [
            {
              type: "BlobStorage",
              params: {
                connectionString: "connString",
                containerName: "container",
                blobFilename: "foo"
              }
            }
          ]
        }
      ]
    }
  ]
} as any;
describe("constructDataPipelineHandlers", () => {
  it("should return an array of transformation handlers related to given config", () => {
    const res = constructDataPipelineHandlers(config);
    expect(res[0][0].mappings.length).toEqual(2);
    expect(res[0][0].enrichs.length).toEqual(1);
    expect(res[0][0].filters).toEqual([])
  });
});
