import {
  DeepClient,
  SerialOperation,
} from '@deep-foundation/deeplinks/imports/client';
import { Exp } from '@deep-foundation/deeplinks/imports/client';
import { Link as LinkWithTypedParameter } from '@deep-foundation/deeplinks/imports/minilinks';
type Link = LinkWithTypedParameter<number>;

async ({
  deep,
  data: { newLink: convertLink },
}: {
  deep: DeepClient;
  data: { newLink: Link };
}) => {
  const logs: Array<string> = [];
  const util = require('util');
  const { JSONSchema7 } = require('json-schema');
  const {
    createSerialOperations,
  } = require('@deep-foundation/deeplinks/imports/gql');
  const {
    DeepClient,
    SerialOperation,
  } = require('@deep-foundation/deeplinks/imports/client');
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
    jsonSchemaProperty: object;
    logDepth: number;
    deep: DeepClient;
  }

  type PropertyConverter = (param: PropertyConverterParam) => Promise<void>;

  type JsonSchemaConverter = (jsonSchema: object) => Promise<void>;

  interface JsonSchemaConverterParam {
    deep: object;
    jsonSchema: JSONSchema7;
    containerLinkId: number;
    propertyConverter: PropertyConverter;
  }

  async function getDefaultJsonSchemaConverter(param: { logDepth: number }) {
    const { logDepth } = param;
    async function defaultJsonSchemaConverter(param: JsonSchemaConverterParam) {
      const log = getLogger('defaultJsonSchemaConverter');
      log(util.inspect({ param }, { depth: logDepth }));
      const serialOperations: Array<object> = [];
      const { deep, jsonSchema, containerLinkId, propertyConverter } = param;
      const { type } = jsonSchema;

      propertyConverter({
        jsonSchemaProperty,
        parentLinkId: rootLinkId,
      });
    }
    return defaultJsonSchemaConverter;
  }

  async function defaultPropertyConverter(param: PropertyConverterParam) {
    const log = getLogger('defaultPropertyConverter');
    log(util.inspect({ param }, { depth: logDepth }));
    const { deep, jsonSchemaProperty, parentLinkId } = param;
    const serialOperations: Array<SerialOperation> = [];
    if (Array.isArray(type) ? type.includes('object') : type === 'object') {
      const { properties, title } = jsonSchema;
      if (!properties) {
        return;
      }
      // * 3 because we reserve id for Type, Contain, Value
      const reservedLinkIds = await deep.reserve((properties.length + 1) * 3);
      const rootLinkId = reservedLinkIds.pop();
      const containLinkId = reservedLinkIds.pop();
      const typeTypeLinkId = await deep.id('@deep-foundation/core', 'Type');
      const containTypeLinkId = await deep.id(
        '@deep-foundation/core',
        'Contain'
      );
      const rootTypeInsertSerialOperations = {
        type: 'insert',
        table: 'links',
        objects: {
          id: rootLinkId,
          type_id: typeTypeLinkId,
        },
      };
      serialOperations.push(rootTypeInsertSerialOperations);
      const containInsertSerialOperation = {
        type: 'insert',
        table: 'links',
        objects: {
          type_id: containTypeLinkId,
          from_id: containerLinkId,
          to_id: rootLinkId,
        },
      };
      serialOperations.push(containInsertSerialOperation);
      const valueForContainInsertSerialOperation = {
        type: 'insert',
        table: 'strings',
        objects: {
          link_id: containLinkId,
          value: title,
        },
      };
      serialOperations.push(valueForContainInsertSerialOperation);
      for (const [propertyName, property] of Object.entries(properties)) {
        await propertyConverter({
          rootLinkId,
          jsonSchemaProperty,
        });
      }
    } else if (
      Array.isArray(type) ? type.includes('array') : type === 'array'
    ) {
    } else if (
      Array.isArray(type) ? type.includes('string') : type === 'string'
    ) {
    } else if (
      Array.isArray(type) ? type.includes('number') : type === 'number'
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
};
