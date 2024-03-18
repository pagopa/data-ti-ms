import {
  Configuration,
  DataFilter,
  DataMapping,
  ExcludeInputMapping,
  MultipleInputMapping,
  SelectInputMapping
} from "@pagopa/data-indexer-commons";
import { SingleInputMapping } from "@pagopa/data-indexer-commons/lib/types/mapping/singleInput";
import {
  DocumentModelVersionedQuery,
  EnrichmentDataSource
} from "@pagopa/data-indexer-commons/lib/types/enrichment/enrichment";

import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as AR from "fp-ts/lib/Array";
import {
  createBlobStorageEnrichmentService,
  createTableStorageEnrichmentService
} from "../enrichment/storage/service";
import { applySingleInput } from "../formatter/apply";
import { createCosmosQueryEnrichmentService } from "../enrichment/query/cosmos/service";
import {
  applyFindByKeyQueryEnrichment,
  applyVersionedQueryEnrichment
} from "../enrichment/apply";
import { filterDynamic, filterStatic } from "../filtering/filter";
import {
  IFormatterMapping,
  excludeInputFormatterHandlerMappings,
  multipleInputFormatterHandlerMappings,
  selectInputFormatterHandlerMappings,
  singleInputFormatterHandlerMappings
} from "./mappings";
import { EnrichmentApplier, MappingFilter, MappingFormatter } from "./types";

const NOT_MAPPED_ERROR = "Not Mapped!";
const NOT_IMPLEMENTED_ERROR = "Not Implemented!";

const getHandler = <T>(
  arr: ReadonlyArray<IFormatterMapping<T>>,
  dataMapping: DataMapping
): MappingFormatter<T, Record<string, unknown>> =>
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
): MappingFormatter<T, Record<string, unknown>> =>
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
): MappingFormatter<T, Record<string, unknown>> =>
  pipe(multipleInputFormatterHandlerMappings(), mappingArr =>
    getHandler(mappingArr, multipleInputMapping)
  );

export const getSelectInputHandler = <T extends Record<string, unknown>>(
  selectInputMapping: SelectInputMapping
): MappingFormatter<T, Record<string, unknown>> =>
  pipe(selectInputFormatterHandlerMappings(), mappingArr =>
    getHandler(mappingArr, selectInputMapping)
  );

export const getExcludeInputHandler = <T extends Record<string, unknown>>(
  excludeInputMapping: ExcludeInputMapping
): MappingFormatter<T, Record<string, unknown>> =>
  pipe(excludeInputFormatterHandlerMappings(), mappingArr =>
    getHandler(mappingArr, excludeInputMapping)
  );

export const mapFilter = <T extends Record<string, unknown>>(
  mapping: DataFilter
): MappingFilter<T> => {
  switch (mapping.filterType) {
    case "STATIC":
      return filterStatic(
        mapping.fieldName,
        mapping.condition,
        mapping.staticValue
      );
    case "DYNAMIC":
      return filterDynamic(
        mapping.fieldName,
        mapping.condition,
        mapping.compareField
      );
    default:
      throw Error(NOT_MAPPED_ERROR);
  }
};

export const mapFormatting = <T extends Record<string, unknown>>(
  mapping: DataMapping
): MappingFormatter<T, Record<string, unknown>> => {
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
): EnrichmentApplier<T, Record<string, unknown>> => {
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
      return pipe(
        createCosmosQueryEnrichmentService(enrichment.params.connectionString),
        E.getOrElseW(() => {
          throw Error("Cannot create Cosmos Query Enrichment Service");
        }),
        service =>
          pipe(
            enrichment.params,
            O.fromPredicate(DocumentModelVersionedQuery.is),
            O.map(params =>
              applyVersionedQueryEnrichment(
                params.dbName,
                params.dbResourceName,
                params.streamKeyFieldName,
                params.streamPkFieldName,
                params.dbResourceVersionFieldName
              )(service.findLastVersionByKey)
            ),
            O.getOrElse(() =>
              applyFindByKeyQueryEnrichment(
                enrichment.params.dbName,
                enrichment.params.dbResourceName,
                enrichment.params.streamKeyFieldName,
                enrichment.params.streamPkFieldName
              )(service.findByKey)
            )
          )
      );
    case "MongoDB":
      throw Error(NOT_IMPLEMENTED_ERROR);
    case "PosgresDB":
      throw Error(NOT_IMPLEMENTED_ERROR);
    default:
      throw Error(NOT_MAPPED_ERROR);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const constructDataPipelineHandlers = (config: Configuration) =>
  pipe(
    config.dataPipelines,
    RA.map(pipeline =>
      pipe(
        pipeline.dataTransformation,
        RA.map(step => ({
          enrichs: pipe(
            step.dataEnrichment,
            O.fromNullable,
            O.map(RA.map(mapEnrichment)),
            O.getOrElse(() => [])
          ),
          filters: pipe(
            step.dataFilter,
            O.fromNullable,
            O.map(RA.map(mapFilter)),
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
  );
