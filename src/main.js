import { send, SUCCESS, FAILED } from 'cfn-response-async';
import enableApigwApiKeysForMethods from './enableApigwApiKeysForMethods';

/**
 * Handler for custom cloudformation resource set apikeyRequired on all methods except OPTIONS
 *
 * @param {Object} event
 * @param {Obhect} context
 */
const handler = async (event, context) => {
  try {
    console.log('request:', JSON.stringify(event, undefined, 2));

    const { RequestType, ResourceProperties } = event;
    const { ApiIds, StageName } = ResourceProperties;

    if (RequestType === 'Create' || RequestType === 'Update') {
      console.debug('Updating ApiIds');
      const promises = ApiIds.map((apiId) => enableApigwApiKeysForMethods(apiId, StageName));
      await Promise.all(promises);
    }

    await send(event, context, SUCCESS, {
      Response: `Hello, async/await CustomResource`,
    });
  } catch (err) {
    console.error(err);
    await send(event, context, FAILED, {
      Response: `Hello, async/await CustomResource`,
    });
  }
};

export { handler };
