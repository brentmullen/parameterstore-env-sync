const fs = require('fs');
const os = require('os');

const parseEnv = (envFilename) => {
  const data = fs.readFileSync(envFilename, 'utf8').toString().split(os.EOL);
  const env = {};

  // eslint-disable-next-line  no-restricted-syntax
  for (const line of data) {
    const [key, ...value] = line.split('=');

    if (!key.trim().startsWith('#')) {
      env[key] = value.join('=');
    }
  }

  return env;
};

exports.parseEnv = parseEnv;
