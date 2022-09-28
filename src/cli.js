#!/usr/bin/env node

const {program} = require('commander');
const clc = require("cli-color");
const {validateFileLocations} = require('./lib/file');
const {syncEnvFiles, syncWithParameterStore} = require('./lib/sync');

program
    .option('-e, --env <envFilePath>', 'Act on this env file', './.env')
    .option('-x, --example-env <exampleEnvFilePath>', 'Example env file of required vars', './.env.example')
    .option('-p, --parameter-path <parameterPath>', 'Path for parameters in AWS Parameter Store')
    .option('-c, --create-env', 'Create the env file from the example, if it does not exist', false)
    .option('-s, --skip-example', 'Skip sync from example env file', false)
    .option('-f, --force-update-all', 'Overwrite any values not protected with #no-overwrite', false);

program.parse(process.argv);

(async () => {
    const options = program.opts();

    console.log(clc.magenta.bold(`--------------------------------------------------`));
    console.log(clc.magenta.bold(`-  `) + clc.green.bold(`Environment File Sync w/ AWS Parameter Store`) + clc.magenta.bold(`  -`));
    console.log(clc.magenta.bold(`--------------------------------------------------`));
    console.log(``);
    console.log(clc.blue(`ENV File: `) + clc.green(options.env));
    console.log(clc.blue(`ENV Example File: `) + clc.green(options.exampleEnv));
    console.log(clc.blue(`Parameter Store Path: `) + clc.green(options.parameterPath));
    console.log(clc.blue(`Create Missing ENV File? `) + clc.green(options.createEnv ? `Yes` : `No`));
    console.log(clc.blue(`Skip Sync from ENV Example File? `) + clc.green(options.skipExample ? `Yes` : `No`));
    console.log(clc.blue(`Force Update on All Values? `) + clc.green(options.forceUpdateAll ? `Yes` : `No`));
    console.log(``);

    if (!options.parameterPath) {
        console.error(clc.red(`Must specify the parameter store path (-p /local/example-app/)`));
        console.log(``);
        process.exit(1);
    }

    if (!validateFileLocations(options.env, options.exampleEnv, options.createEnv)) {
        console.log(``);
        process.exit(1);
    }

    if (!options.skipExample) {
        console.log(clc.magenta.bold(`Sync Missing Variables from Example ENV`));
        syncEnvFiles(options.env, options.exampleEnv, options.forceUpdateAll);
        console.log(``);
    }

    console.log(clc.magenta.bold(`Sync Variables with AWS Parameter Store`));
    await syncWithParameterStore(options.env, options.parameterPath, options.forceUpdateAll);
    console.log(``);

    console.log(clc.magenta.bold(`Sync complete!`));
})();
