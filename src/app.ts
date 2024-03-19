/* eslint-disable no-console */
import express from "express";
import * as bodyParser from "body-parser";
import { getConfigOrThrow } from "./utils/configReader";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createApp = async () => {
  const config = getConfigOrThrow();
  const app = express();
  // Parse the incoming request body. This is needed by Passport spid strategy.
  app.use(
    bodyParser.json({
      verify: (_req, res: express.Response, buf, _encoding: BufferEncoding) => {
        // eslint-disable-next-line functional/immutable-data
        res.locals.body = buf;
      }
    })
  );

  // Parse an urlencoded body.
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/info", (_: express.Request, res) =>
    res.status(200).json({ status: "OK" })
  );

  app.listen(config.SERVER_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Data Transformer and Indexer app listening on port ${config.SERVER_PORT}`
    );
  });
};
