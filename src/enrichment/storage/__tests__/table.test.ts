import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { tableEnrich } from "../table";
import * as tableUtils from "../../../utils/tableStorage";

const input = {
  partitionKey: "pk",
  rowKey: "rk",
  foo: "foo",
  bar: 1
};

const getTableDocumentMock = jest.spyOn(tableUtils, "getTableDocument");

const tableClientMock = {} as any;
describe("tableEnrich", () => {
  it("should raise an error if input Key Fields are not strings", async () => {
    await pipe(
      tableEnrich(tableClientMock)("foo", "bar")(input),
      TE.bimap(
        err => {
          expect(err).toBeDefined();
          expect(err.message).toEqual(
            expect.stringContaining(
              "Given key fields from input stream are not valid"
            )
          );
        },
        () => fail("it should fail: Given key input are notstrings")
      )
    )();
  });

  it("should raise an error if table storage is ureachable", async () => {
    getTableDocumentMock.mockImplementationOnce(() =>
      TE.left(Error("Table unreachable"))
    );
    await pipe(
      tableEnrich(tableClientMock)("partitionKey", "partitionKey")(input),
      TE.bimap(
        err => {
          expect(err).toBeDefined();
          expect(err.message).toEqual("Table unreachable");
        },
        () => fail("it should fail: Table storage is unreachable")
      )
    )();
  });

  it("should return the same input if table document is missing and not found is set to be ignored", async () => {
    getTableDocumentMock.mockImplementationOnce(() => TE.right(O.none));
    await pipe(
      tableEnrich(tableClientMock)("partitionKey", "rowKey")(input),
      TE.bimap(
        () => fail("it should not fail"),
        result => expect(result).toEqual(input)
      )
    )();
  });

  it("should return left if table document is missing and not found is set to be a blocking error", async () => {
    getTableDocumentMock.mockImplementationOnce(() => TE.right(O.none));
    await pipe(
      tableEnrich(tableClientMock, false)("partitionKey", "rowKey")(input),
      TE.bimap(
        err => expect(err).toBeDefined(),
        () => fail("it should fail"),
      )
    )();
  });

  it("should return enriched input if table document is found", async () => {
    getTableDocumentMock.mockImplementationOnce(() =>
      TE.right(O.some({ baz: "baz" }))
    );
    await pipe(
      tableEnrich(tableClientMock)("partitionKey", "rowKey")(input),
      TE.bimap(
        () => fail("it should not fail"),
        result => expect(result).toEqual({ ...input, baz: "baz" })
      )
    )();
  });

  it("should return enriched input in a specific field if table document is found and output field name is provided", async () => {
    getTableDocumentMock.mockImplementationOnce(() =>
      TE.right(O.some({ baz: "baz" }))
    );
    await pipe(
      tableEnrich(tableClientMock)("partitionKey", "rowKey", "enrichedField")(
        input
      ),
      TE.bimap(
        () => fail("it should not fail"),
        result =>
          expect(result).toEqual(
            { ...input, enrichedField: { baz: "baz" } }
          )
      )
    )();
  });

  it("should return flattened enriched input if table document is found and output field name is not provided", async () => {
    getTableDocumentMock.mockImplementationOnce(() =>
      TE.right(O.some({ baz: "baz" }))
    );
    await pipe(
      tableEnrich(tableClientMock)("partitionKey", "rowKey")(input),
      TE.bimap(
        () => fail("it should not fail"),
        result => expect(result).toEqual({ ...input, baz: "baz" })
      )
    )();
  });
});
