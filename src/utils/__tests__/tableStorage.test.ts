import { pipe } from "fp-ts/lib/function";
import { getTableDocument } from "../tableStorage";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";

const aTableDocument = {
  partitionKey: "PK",
  rowKey: "rowKey",
  foo: "foo",
  otherProp: 1
};

const getEntityMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve(aTableDocument));
const tableClientMock = {
  getEntity: getEntityMock
} as any;
describe("tableStorage", () => {
  it("should return an error if there is an error while retrieving document on table storage", async () => {
    getEntityMock.mockImplementationOnce(() =>
      Promise.reject({ statusCode: 500, details: "Cannot find document" })
    );
    await pipe(
      getTableDocument(tableClientMock, "PK", "rowKey"),
      TE.bimap(
        err => expect(err).toBeDefined(),
        () => fail("it should fail")
      )
    )();
  });

  it("should return none if Not Found error is returned while retrieving document on table storage", async () => {
    getEntityMock.mockImplementationOnce(() =>
      Promise.reject({ statusCode: 404, details: "Document not found" })
    );
    await pipe(
      getTableDocument(tableClientMock, "PK", "rowKey"),
      TE.bimap(
        () => fail("it should not fail"),
        res => expect(res).toBe(O.none)
      )
    )();
  });

  it("should return table document if document is found on table storage", async () => {
    await pipe(
      getTableDocument(tableClientMock, "PK", "rowKey"),
      TE.bimap(
        () => fail("it should not fail"),
        res => expect(res).toEqual(O.some(aTableDocument))
      )
    )();
  });
});
