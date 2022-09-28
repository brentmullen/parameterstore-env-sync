const { parseEnv } = require('./parse');
const { writeEnvVarChanges } = require('./file');
const { fetchParameterStoreValues } = require('./ssm');

const shouldSyncEnvVar = (currentEnvMap, key, value, forceUpdate = false) => {
  // Ignore comment lines
  if (key.trim().startsWith('#')) {
    return false;
  }

  // Env var not defined in env file
  if (!Object.keys(currentEnvMap).includes(key)) {
    return true;
  }

  // Env var exists, but we don't have a new value to update it with
  if (!value) {
    return false;
  }

  // Current env var has no value
  if (!currentEnvMap[key]) {
    return true;
  }

  // Values are the same, no need to update
  if (value === currentEnvMap[key]) {
    return false;
  }

  // ENV var lines ends with #do-not-overwrite, ignoring
  if (currentEnvMap[key].trim().replace(' ', '').endsWith('#do-not-overwrite')) {
    return false;
  }

  // ENV var is defined, only sync if forcing update
  return forceUpdate;
};

const syncMap = (envFilename, syncSourceMap, forceUpdate) => {
  const currentEnvMap = parseEnv(envFilename);
  const shouldSyncMap = {};

  // eslint-disable-next-line  no-restricted-syntax
  for (const [key, value] of Object.entries(syncSourceMap)) {
    if (shouldSyncEnvVar(currentEnvMap, key, value, forceUpdate)) {
      shouldSyncMap[key] = value;
    }
  }

  writeEnvVarChanges(envFilename, shouldSyncMap);
};

const syncEnvFiles = (envFilename, exampleEnvFilename, forceUpdate) => {
  const exampleEnvMap = parseEnv(exampleEnvFilename);

  syncMap(envFilename, exampleEnvMap, forceUpdate);
};

const syncWithParameterStore = async (envFilename, parameterPath, forceUpdate) => {
  const parameterStoreMap = await fetchParameterStoreValues(parameterPath);
  const syncSourceMap = {};

  // eslint-disable-next-line  no-restricted-syntax
  for (const parameter of parameterStoreMap) {
    const key = parameter.Name.replace(parameterPath, '').toUpperCase();
    syncSourceMap[key] = parameter.Value;
  }

  syncMap(envFilename, syncSourceMap, forceUpdate);
};

exports.syncEnvFiles = syncEnvFiles;
exports.syncWithParameterStore = syncWithParameterStore;
