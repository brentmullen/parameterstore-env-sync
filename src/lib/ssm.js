const { SSMClient, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');
const clc = require('cli-color');

const fetchParameterStoreValues = async (parameterPath, nextToken = '') => {
  const parameters = [];
  const client = new SSMClient({});

  const params = {
    Path: parameterPath.trim(),
    WithDecryption: true,
    MaxResults: 10,
  };

  if (nextToken) {
    params.NextToken = nextToken;
  }

  const command = new GetParametersByPathCommand(params);

  try {
    const data = await client.send(command);
    parameters.push(...data.Parameters);

    if (data.NextToken) {
      parameters.push(...await fetchParameterStoreValues(parameterPath, data.NextToken));
    }
  } catch (error) {
    console.log(clc.red('Failure encountered fetching from AWS Parameter Store'));
    console.log(clc.red(error));
    console.log('');
    process.exit(1);
  }

  return parameters;
};

exports.fetchParameterStoreValues = fetchParameterStoreValues;
