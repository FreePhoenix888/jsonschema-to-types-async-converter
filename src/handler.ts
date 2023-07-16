import {
  DeepClient,
  SerialOperation,
} from '@deep-foundation/deeplinks/imports/client';
import { Exp } from '@deep-foundation/deeplinks/imports/client';
import { Link as LinkWithTypedParameter } from '@deep-foundation/deeplinks/imports/minilinks';
type Link = LinkWithTypedParameter<number>;
import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';
import { types } from 'util';

async ({
  deep,
  data: { newLink: convertLink },
}: {
  deep: DeepClient;
  data: { newLink: Link };
}) => {
  const logs: Array<string> = [];
  const util = await import('util');
  const { createSerialOperation } = await import(
    '@deep-foundation/deeplinks/imports/gql/index.js'
  );
  const { DeepClient } = await import(
    '@deep-foundation/deeplinks/imports/client'
  );
  const { Link } = require('@deep-foundation/deeplinks/imports/minilinks');

  try {
    const result = await main();
    return {
      result,
      logs,
    };
  } catch (error) {
    throw {
      error: util.inspect(error),
      logs,
    };
  }

  async function main() {
    const util = require('util');
    const DEFAULT_LOG_DEPTH = 3;
    let logDepth = DEFAULT_LOG_DEPTH;
    const config = await getConfig({ logDepth });
    logDepth = config.logDepth;
    logs.push(util.inspect({ config }));
    const jsonSchema = await getJsonSchema({
      logDepth,
    });

    const linkIdsToBeReservedCount = await getLinkIdsToBeReservedCount({jsonSchema});
    
  }

  function getLogger(namespace: string) {
    return (message: string) => {
      logs.push(`${namespace}: ${message}`);
    };
  }

  async function getJsonSchemaLink(param: { logDepth: number }) {
    const { logDepth } = param;

    const log = getLogger('getJsonSchemaLink');
    const selectData = {
      id: convertLink.to_id,
    };
    log(util.inspect({ selectData }, { depth: logDepth }));
    async function onNotFound() {
      throw new Error(
        `Json schema is not found. Select with data ${JSON.stringify(
          selectData
        )} returned empty result`
      );
    }
    log(util.inspect({ onNotFound }, { depth: logDepth }));
    const link = await getLink({
      selectData,
      onNotFound,
    });
    log(util.inspect({ link }, { depth: logDepth }));
    return link;
  }

  async function getJsonSchema(param: { logDepth: number }) {
    const { logDepth } = param;
    const link = await getJsonSchemaLink({
      logDepth,
    });
    const jsonSchema = link.value?.value;
    if (!jsonSchema) {
      throw new Error(`##${link.id} must have value`);
    }
    return jsonSchema;
  }

  async function getConfigLink(param: { logDepth: number }) {
    const { logDepth } = param;
    const log = getLogger('getConfigLink');
    log(util.inspect({ param }, { depth: logDepth }));
    const selectData = {
      id: convertLink.from_id,
    };
    log(util.inspect({ selectData }, { depth: logDepth }));
    async function onNotFound() {
      throw new Error(
        `Config link is not found. Select with data ${JSON.stringify(
          selectData
        )} returned empty result`
      );
    }
    log(util.inspect({ onNotFound }, { depth: logDepth }));
    const link = await getLink({
      selectData,
      onNotFound,
    });
    log(util.inspect({ link }, { depth: logDepth }));
    return link;
  }

  interface Config {
    deep: DeepClient;
    converter: JsonSchemaConverter;
    logDepth: number;
    containerLinkId: number;
  }

  async function getConfig(param: { logDepth: number }): Promise<Config> {
    const { logDepth } = param;
    const log = getLogger('getConfig');
    log(util.inspect({ param }, { depth: logDepth }));
    const link = await getConfigLink({
      logDepth,
    });
    log(util.inspect({ link }, { depth: logDepth }));
    const config = link.value?.value;
    log(util.inspect({ config }, { depth: logDepth }));
    if (!config) {
      throw new Error(`##${link.id} must have value`);
    }
    const result: Config = {
      containerLinkId: config.containerLinkId,
    };
    log(util.inspect({ result }, { depth: logDepth }));
    return result;
  }

  interface PropertyConverterParam {
    parentLinkId: number;
    logDepth: number;
    deep: DeepClient;
    jsonSchema: JSONSchema7Definition;
    containerLinkId: number;
    name: string;
    valueTypeLinkId: number;
    objectTypeLinkId: number;
    stringTypeLinkId: number;
    numberTypeLinkId: number;
  }

  type PropertyConverter = (param: PropertyConverterParam) => Promise<void>;

  type JsonSchemaConverter = (jsonSchema: object) => Promise<void>;

  interface JsonSchemaConverterParam {
    deep: object;
    jsonSchema: JSONSchema7Definition;
    containerLinkId: number;
    propertyConverter: PropertyConverter;
  }

  // async function getDefaultJsonSchemaConverter(param: { logDepth: number }) {
  //   const { logDepth } = param;
  //   async function defaultJsonSchemaConverter(param: JsonSchemaConverterParam) {
  //     const log = getLogger('defaultJsonSchemaConverter');
  //     log(util.inspect({ param }, { depth: logDepth }));
  //     const serialOperations: Array<object> = [];
  //     const { deep, jsonSchema, containerLinkId, propertyConverter } = param;
  //     const { type } = jsonSchema;

  //     propertyConverter({
  //       jsonSchemaProperty,
  //       parentLinkId: rootLinkId,
  //     });
  //   }
  //   return defaultJsonSchemaConverter;
  // }

  async function defaultPropertyConverter(param: PropertyConverterParam) {
    const log = getLogger('defaultPropertyConverter');
    const {
      deep,
      parentLinkId,
      logDepth,
      jsonSchema,
      containerLinkId,
      name,
      valueTypeLinkId,
      numberTypeLinkId,
      objectTypeLinkId,
      stringTypeLinkId,
    } = param;
    log(util.inspect({ param }, { depth: logDepth }));
    const serialOperations: Array<SerialOperation> = [];


    if (typeof jsonSchema === 'boolean') {
      count += 4;
    } else if (jsonSchema.properties) {
      for (const property in jsonSchema.properties) {
        count += 4;
        count += getLinkIdsToBeReservedCount({ jsonSchema: jsonSchema.properties[property] });
      }
    } else if (jsonSchema.items) {
      if (Array.isArray(jsonSchema.items)) {
        jsonSchema.items.forEach((item) =>
          count += getLinkIdsToBeReservedCount({ jsonSchema: item })
        );
      } else {
        count += getLinkIdsToBeReservedCount({ jsonSchema: jsonSchema.items });
      }
    }
    
    // Draft
    if (typeof jsonSchema === 'boolean') {
      const reservedLinkIds = await deep.reserve(4);
      const rootLinkId = reservedLinkIds.pop()!;
      const containLinkId = reservedLinkIds.pop()!;
      const valueLinkId = reservedLinkIds.pop()!;
      const containForValueLinkId = reservedLinkIds.pop()!;
      const typeTypeLinkId = await deep.id('@deep-foundation/core', 'Type');
      const containTypeLinkId = await deep.id(
        '@deep-foundation/core',
        'Contain'
      );
      const rootTypeInsertSerialOperations = createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          id: rootLinkId,
          type_id: typeTypeLinkId,
          ...(parentLinkId && {
            from_id: parentLinkId,
            to_id: parentLinkId,
          }),
        },
      });
      serialOperations.push(rootTypeInsertSerialOperations);
      const containInsertSerialOperation = createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          type_id: containTypeLinkId,
          from_id: containerLinkId,
          to_id: rootLinkId,
        },
      });
      serialOperations.push(containInsertSerialOperation);
      const valueForContainInsertSerialOperation = createSerialOperation({
        type: 'insert',
        table: 'strings',
        objects: {
          link_id: containLinkId,
          value: name,
        },
      });
      serialOperations.push(valueForContainInsertSerialOperation);
      const valueLinkInsertSerialOperation = createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          id: valueLinkId,
          type_id: valueTypeLinkId,
          from_id: rootLinkId,
          to_id: objectTypeLinkId,
        },
      });
      serialOperations.push(valueLinkInsertSerialOperation);
      const containForValueLinkInsertSerialOperation = createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          id: containForValueLinkId,
          type_id: containTypeLinkId,
          from_id: containerLinkId,
          to_id: valueLinkId,
        },
      });
      serialOperations.push(containForValueLinkInsertSerialOperation);
    } else if (
      Array.isArray(jsonSchema.type)
        ? jsonSchema.type.includes('object')
        : jsonSchema.type === 'object'
    ) {
      const { properties, title } = jsonSchema;
      if (!properties) {
        return;
      }
      // +1 for this type.* 3 because we reserve id for Type, Contain, Value.
      const reservedLinkIds = await deep.reserve(
        (Object.keys(properties).length + 1) * 4
      );
      const rootLinkId = reservedLinkIds.pop()!;
      const containLinkId = reservedLinkIds.pop()!;
      const typeTypeLinkId = await deep.id('@deep-foundation/core', 'Type');
      const containTypeLinkId = await deep.id(
        '@deep-foundation/core',
        'Contain'
      );
      const rootTypeInsertSerialOperations = createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          id: rootLinkId,
          type_id: typeTypeLinkId,
          ...(parentLinkId && {
            from_id: parentLinkId,
            to_id: parentLinkId,
          }),
        },
      });
      serialOperations.push(rootTypeInsertSerialOperations);
      const containInsertSerialOperation = createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          type_id: containTypeLinkId,
          from_id: containerLinkId,
          to_id: rootLinkId,
        },
      });
      serialOperations.push(containInsertSerialOperation);
      const valueForContainInsertSerialOperation = createSerialOperation({
        type: 'insert',
        table: 'strings',
        objects: {
          link_id: containLinkId,
          value: title,
        },
      });
      serialOperations.push(valueForContainInsertSerialOperation);
      for (const [propertyName, propertyValue] of Object.entries(properties)) {
        await defaultPropertyConverter({
          containerLinkId,
          deep,
          jsonSchema: propertyValue,
          logDepth,
          name: propertyName,
          parentLinkId: rootLinkId,
          numberTypeLinkId,
          objectTypeLinkId,
          stringTypeLinkId,
          valueTypeLinkId,
        });
      }
    } else if (
      Array.isArray(jsonSchema.type)
        ? jsonSchema.type.includes('array')
        : jsonSchema.type === 'array'
    ) {
      if (!jsonSchema.items) {
        return;
      }
    } else if (
      Array.isArray(jsonSchema.type)
        ? jsonSchema.type.includes('string')
        : jsonSchema.type === 'string'
    ) {
    } else if (
      Array.isArray(jsonSchema.type)
        ? jsonSchema.type.includes('number')
        : jsonSchema.type === 'number'
    ) {
    }
  }

  interface GetLinkParam {
    selectData: object;
    onNotFound: () => Promise<void>;
  }

  async function getLink(param: GetLinkParam) {
    const { selectData, onNotFound: onError } = param;
    const {
      data: [linkConfig],
    } = await deep.select(selectData);
    if (!linkConfig) {
      await onError();
    }
    return linkConfig;
  }

  function getLinkIdsToBeReservedCount({
    jsonSchema,
  }: {
    jsonSchema: JSONSchema7Definition;
  }): number {
    let count = 0;

    if (typeof jsonSchema === 'boolean') {
      count += 4;
    } else if (jsonSchema.properties) {
      for (const property in jsonSchema.properties) {
        count += 4;
        count += getLinkIdsToBeReservedCount({ jsonSchema: jsonSchema.properties[property] });
      }
    } else if (jsonSchema.items) {
      if (Array.isArray(jsonSchema.items)) {
        jsonSchema.items.forEach((item) =>
          count += getLinkIdsToBeReservedCount({ jsonSchema: item })
        );
      } else {
        count += getLinkIdsToBeReservedCount({ jsonSchema: jsonSchema.items });
      }
    }

    return count;
  }
};
