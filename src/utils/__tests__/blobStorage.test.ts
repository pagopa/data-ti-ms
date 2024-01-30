import { pipe } from "fp-ts/lib/function";
import { getBlobDocument } from "../blobStorage";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";

const blobStreamReadMock = jest.fn();
const blobDownloadMock = jest
  .fn()
  .mockResolvedValue({ readableStreamBody: { read: blobStreamReadMock } });

const blobClientMock = {
  download: blobDownloadMock
};
const containerClientMock = {
  getBlobClient: jest.fn().mockReturnValue(blobClientMock)
} as any;

const blobName = "blobName.json" as any;
describe("getBlobDocument", () => {
  it("should raise an error if blobStorage is unreacheable", async () => {
    blobDownloadMock.mockRejectedValueOnce({
      statusCode: 500,
      message: "Blob unreachable"
    });
    await pipe(
      getBlobDocument(containerClientMock, blobName),
      TE.bimap(
        err => {
          expect(err).toBeDefined();
          expect(err.message).toEqual(
            expect.stringContaining("Blob unreachable")
          );
        },
        () => fail("it should fail: Blob is unreachable")
      )
    )();
  });

  it("should raise an error if blob body is not a valid Json", async () => {
    blobStreamReadMock.mockReturnValueOnce("foo");
    await pipe(
      getBlobDocument(containerClientMock, blobName),
      TE.bimap(
        err => {
          expect(err).toBeDefined();
          expect(err.message).toEqual(expect.stringContaining("Unexpected"));
        },
        () => fail("it should fail: Blob body is not a valid Json")
      )
    )();
  });

  it("should return none if blob document is missing", async () => {
    blobDownloadMock.mockRejectedValueOnce({
      statusCode: 404,
      message: "Blob Not Found"
    });
    await pipe(
      getBlobDocument(containerClientMock, blobName),
      TE.bimap(
        () => fail("it should not fail: Blob is missing"),
        result => expect(O.isNone(result)).toBeTruthy()
      )
    )();
  });

  it("should return a blob document identified by its name", async () => {

    blobStreamReadMock.mockReturnValueOnce(JSON.stringify({ foo: "foo" }));
    await pipe(
      getBlobDocument(containerClientMock, blobName),
      TE.bimap(
        err => {
          console.log(err);
          fail("it should not fail: Blob is present");
        },
        O.fold(
          () => fail("it should be some"),
          result => expect(result).toEqual({ foo: "foo" })
        )
      )
    )();
  });
});
