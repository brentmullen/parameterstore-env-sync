const os = require('os');
const fs = require('fs');
const clc = require('cli-color');

const validateFileExists = (filename) => {
  try {
    return fs.existsSync(filename);
  } catch (err) {
    return false;
  }
};

const writeEnvVarChanges = (envFilename, syncMap) => {
  let data = fs.readFileSync(envFilename, 'utf8');

  // eslint-disable-next-line  no-restricted-syntax
  for (const [key, value] of Object.entries(syncMap)) {
    const expression = new RegExp(`^${key}=(.*)`, 'gm');

    if (data.match(expression)) {
      console.log(clc.blue('Updating ') + clc.green(key));
      data = data.replace(expression, `${key}=${value}`);
    } else {
      console.log(clc.blue('Appending ') + clc.green(key) + clc.blue(' to env file'));
      data = `${data}${os.EOL}${key}=${value}`;
    }
  }

  fs.writeFileSync(envFilename, data, 'utf8');
};

const validateFileLocations = (envFilename, exampleEnvFilename, createEnvFile) => {
  if (!validateFileExists(exampleEnvFilename)) {
    console.error(clc.red(`Cannot load example env file at ${exampleEnvFilename}`));
    console.log('Pass the location of the example env file with the \'-s\' flag (-s ../.env.example)');
    return false;
  }

  if (!validateFileExists(envFilename)) {
    console.error(clc.red(`Cannot load env file at ${envFilename}`));

    if (!createEnvFile) {
      console.log('Pass the location of the env file with the \'-e\' flag (-e ../.env)');
      console.log('The file can also be automated created based on the example env file by passing the \'-c\' flag.');
      return false;
    }

    console.log(clc.blue(`Env file (${envFilename}) does not exist, creating copy of ${exampleEnvFilename}`));
    try {
      fs.copyFileSync(exampleEnvFilename, envFilename);
    } catch (error) {
      console.error(clc.red(`Unable to write ${envFilename}`));
      console.log(error);

      return false;
    }
  }

  return true;
};

exports.writeEnvVarChanges = writeEnvVarChanges;
exports.validateFileLocations = validateFileLocations;
