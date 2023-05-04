import {
  APIGatewayClient,
  GetResourcesCommand,
  UpdateMethodCommand,
  CreateDeploymentCommand,
} from '@aws-sdk/client-api-gateway';

const client = new APIGatewayClient();

export default async (restApiId, stageName) => {
  const { items } = await client.send(
    new GetResourcesCommand({
      restApiId,
      embed: [`items[?resourceMethods].{p:path,id:id,m:resourceMethods}`],
    })
  );

  const resourcesToChange = [];

  items
    .filter((resource) => !!resource.resourceMethods)
    .forEach((resource) => {
      Object.keys(resource.resourceMethods)
        .filter((httpMethod) => httpMethod !== 'OPTIONS')
        .forEach((httpMethod) => {
          resourcesToChange.push({
            restApiId,
            httpMethod,
            resourceId: resource.id,
            patchOperations: [{ op: 'replace', path: '/apiKeyRequired', value: 'true' }],
          });
        });
    });

  const promises = resourcesToChange.map((params) => client.send(new UpdateMethodCommand(params)));

  await Promise.all(promises);

  // redeploy

  console.debug('Redeploying API stage');

  await client.send(
    new CreateDeploymentCommand({
      restApiId,
      stageName,
    })
  );
};
