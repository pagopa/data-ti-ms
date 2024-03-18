import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { blobEnrich } from "../blob";
import * as blobUtils from "../../../utils/blobStorage";
const input = {
  blobName: "pk",
  foo: "foo",
  bar: 1
};

const getBlobDocumentMock = jest.spyOn(blobUtils, "getBlobDocument");

const containerClientMock = {} as any;
describe("blobEnrich", () => {
  it("should raise an error if blobName Field is not strings", async () => {
    await pipe(
      blobEnrich(containerClientMock)("bar")(input),
      TE.bimap(
        err => {
          expect(err).toBeDefined();
          expect(err.message).toEqual(
            expect.stringContaining(
              "Given Blob name field from input stream is not valid"
            )
          );
        },
        () => fail("it should fail: Given blobName field value is not a string")
      )
    )();
  });

  it("should raise an error if Blob Document cannot be read", async () => {
    getBlobDocumentMock.mockImplementationOnce(() =>
      TE.left(Error("Cannot read Blob"))
    );
    await pipe(
      blobEnrich(containerClientMock)("foo")(input),
      TE.bimap(
        err => {
          expect(err).toBeDefined();
          expect(err.message).toEqual(
            expect.stringContaining("Cannot read Blob")
          );
        },
        () => fail("it should fail: Blob document cannot be read")
      )
    )();
  });

  it("should return the same input if Blob Document is missing and not found is set to be ignored", async () => {
    getBlobDocumentMock.mockImplementationOnce(() => TE.right(O.none));
    await pipe(
      blobEnrich(containerClientMock)("foo")(input),
      TE.bimap(
        () => fail("it should not fail"),
        result => expect(result).toEqual(input)
      )
    )();
  });

  it("should return left if Blob Document is missing and not found is set to be considered as error", async () => {
    getBlobDocumentMock.mockImplementationOnce(() => TE.right(O.none));
    await pipe(
      blobEnrich(containerClientMock, false)("foo")(input),
      TE.bimap(
        err => expect(err).toBeDefined(),
        () => fail("it should fail"),
      )
    )();
  });

  it("should return enriched input into a specific field if Blob Document is found", async () => {
    getBlobDocumentMock.mockImplementationOnce(() =>
      TE.right(O.some({ baz: "baz" }))
    );
    await pipe(
      blobEnrich(containerClientMock)("blobName", "enrichedFieldName")(input),
      TE.bimap(
        () => fail("it should not fail"),
        result =>
          expect(result).toEqual({
            ...input,
            enrichedFieldName: { baz: "baz" }
          })
      )
    )();
  });

  it("should return a flattened enriched input if Blob Document is found without specifying an output field", async () => {
    getBlobDocumentMock.mockImplementationOnce(() =>
      TE.right(O.some({ baz: "baz" }))
    );
    await pipe(
      blobEnrich(containerClientMock)("blobName")(input),
      TE.bimap(
        () => fail("it should not fail"),
        result =>
          expect(result).toEqual({
            ...input,
            baz: "baz"
          })
      )
    )();
  });
});
