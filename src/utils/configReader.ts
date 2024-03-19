import * as t from "io-ts";

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { NonNegativeIntegerFromString } from "@pagopa/ts-commons/lib/numbers";
import { readableReport } from "./logging";

const DEFAULT_SERVER_PORT = "80";
// global app configuration
export type IConfig = t.TypeOf<typeof IConfig>;
export const IConfig = t.type({
  SERVER_PORT: NonNegativeIntegerFromString,
  isProduction: t.boolean
});

// No need to re-evaluate this object for each call
const errorOrConfig: t.Validation<IConfig> = IConfig.decode({
  ...process.env,
  SERVER_PORT: process.env.PORT || DEFAULT_SERVER_PORT,
  isProduction: process.env.NODE_ENV === "production"
});

/**
 * Read the application configuration and check for invalid values.
 * Configuration is eagerly evalued when the application starts.
 *
 * @returns either the configuration values or a list of validation errors
 */
export const getConfig = (): t.Validation<IConfig> => errorOrConfig;

/**
 * Read the application configuration and check for invalid values.
 * If the application is not valid, raises an exception.
 *
 * @returns the configuration values
 * @throws validation errors found while parsing the application configuration
 */
export const getConfigOrThrow = (): IConfig =>
  pipe(
    errorOrConfig,
    E.getOrElse(errors => {
      throw new Error(`Invalid configuration: ${readableReport(errors)}`);
    })
  );
