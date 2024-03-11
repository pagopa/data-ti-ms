import {
  Configuration,
  DataMapping,
  ExcludeInputMapping,
  MultipleInputMapping,
  SelectInputMapping
} from "@pagopa/data-indexer-commons";
import { SingleInputMapping } from "@pagopa/data-indexer-commons/lib/types/mapping/singleInput";
import { EnrichmentDataSource } from "@pagopa/data-indexer-commons/lib/types/enrichment/enrichment";

import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as AR from "fp-ts/lib/Array";
import {
  createBlobStorageEnrichmentService,
  createTableStorageEnrichmentService
} from "../enrichment/storage/service";
import { MappingEnrichment, MappingFormatter } from "../formatter/types";
import { applySingleInput } from "../formatter/apply";
import {
  IFormatterMapping,
  excludeInputFormatterHandlerMappings,
  multipleInputFormatterHandlerMappings,
  selectInputFormatterHandlerMappings,
  singleInputFormatterHandlerMappings
} from "./mappings";

const NOT_MAPPED_ERROR = "Not Mapped!";
const NOT_IMPLEMENTED_ERROR = "Not Implemented!";

const getHandler = <T>(
  arr: ReadonlyArray<IFormatterMapping<T>>,
  dataMapping: DataMapping
): MappingFormatter<T, unknown> =>
  pipe(
    arr,
    AR.map(mapping =>
      pipe(dataMapping, mapping.pattern.decode, E.map(mapping.handler))
    ),
    AR.rights,
    AR.head,
    O.getOrElse(() => {
      throw Error(NOT_MAPPED_ERROR);
    })
  );

export const getSingleInputHandler = <T extends Record<string, unknown>>(
  singleInputMapping: SingleInputMapping
): MappingFormatter<T, unknown> =>
  pipe(
    applySingleInput(
      singleInputMapping.inputFieldName,
      singleInputMapping.outputFieldName
    ),
    singleInputFormatterHandlerMappings,
    mappingArr => getHandler(mappingArr, singleInputMapping)
  );

export const getMultipleInputHandler = <T extends Record<string, unknown>>(
  multipleInputMapping: MultipleInputMapping
): MappingFormatter<T, unknown> =>
  pipe(multipleInputFormatterHandlerMappings(), mappingArr =>
    getHandler(mappingArr, multipleInputMapping)
  );

export const getSelectInputHandler = <T extends Record<string, unknown>>(
  selectInputMapping: SelectInputMapping
): MappingFormatter<T, unknown> =>
  pipe(selectInputFormatterHandlerMappings(), mappingArr =>
    getHandler(mappingArr, selectInputMapping)
  );

export const getExcludeInputHandler = <T extends Record<string, unknown>>(
  excludeInputMapping: ExcludeInputMapping
): MappingFormatter<T, unknown> =>
  pipe(excludeInputFormatterHandlerMappings(), mappingArr =>
    getHandler(mappingArr, excludeInputMapping)
  );

export const mapFormatting = <T extends Record<string, unknown>>(
  mapping: DataMapping
): MappingFormatter<T, unknown> => {
  switch (mapping.type) {
    case "SINGLE_INPUT":
      return getSingleInputHandler(mapping);
    case "MULTIPLE_INPUT":
      return getMultipleInputHandler(mapping);
    case "SELECT_INPUT":
      return getSelectInputHandler(mapping);
    case "EXCLUDE_INPUT":
      return getExcludeInputHandler(mapping);
    default:
      throw Error(NOT_MAPPED_ERROR);
  }
};

export const mapEnrichment = <T extends Record<string, unknown>>(
  enrichment: EnrichmentDataSource
): MappingEnrichment<T, unknown> => {
  switch (enrichment.type) {
    case "BlobStorage":
      return createBlobStorageEnrichmentService(
        enrichment.params.connectionString,
        enrichment.params.containerName
      )(enrichment.params.blobFilename);
    case "TableStorage":
      return createTableStorageEnrichmentService(
        enrichment.params.connectionString,
        enrichment.params.tableName
      )(enrichment.params.partitionKey, enrichment.params.rowKey);
    case "API":
      throw Error(NOT_IMPLEMENTED_ERROR);
    case "CosmosDB":
      throw Error(NOT_IMPLEMENTED_ERROR);
    case "MongoDB":
      throw Error(NOT_IMPLEMENTED_ERROR);
    case "PosgresDB":
      throw Error(NOT_IMPLEMENTED_ERROR);
    default:
      throw Error(NOT_MAPPED_ERROR);
  }
};

export const constructDataPipelineHandlers = (config: Configuration) =>
  pipe(
    config.dataPipelines,
    RA.map(pipeline =>
      pipe(
        pipeline.dataTransformation,
        RA.map(
          flow(
            O.fromNullable,
            O.chain(O.fromPredicate(RA.isEmpty)),
            O.map(step => ({
              enrichs: pipe(
                step.dataEnrichment,
                O.fromNullable,
                O.map(RA.map(mapEnrichment)),
                O.getOrElse(() => [])
              ),
              mappings: pipe(
                step.dataMapping,
                O.fromNullable,
                O.map(RA.map(mapFormatting)),
                O.getOrElse(() => [])
              )
            }))
          )
        )
      )
    )
  );
