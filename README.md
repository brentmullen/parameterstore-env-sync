# parameterstore-env-sync

Pulls secrets needed for local dev from AWS Parameter Store.

## Purpose

Sharing secrets for local development can be a pain. Where do they get stored? Who has access to read? Who can update? Is it painful to get new secrets added to the project?

This is a proposal on how to answer some of these questions.

By keeping needed secrets in AWS Parameter Store, where devs have access, we answer the storage question, we can control who reads and writes, and we can streamline the syncing of the values. If your devs don't have permissions to a shared AWS account, that is a problem, but for my use case, forcing all our devs to request and gain access to said AWS account is an added benefit.

## Installation

```bash
~ npm install --save-dev parameterstore-env-sync
```

Recommend to install as a dev dependency.

## Usage

The command looks for the `.env` file in the current directory and tries to sync values from `.env.example` when the arguments are not specified.

`--parameter-path, -p` **must** be specified. Values will be pulled from AWS Parameter Store matching this path.

```bash
~ parameterstore-env-sync --parameter-path /local/app/
```

To specify the env file or the example env file, use the `--env, -e` and `--example-env, -x` flags.

```bash
~ parameterstore-env-sync --env ./.env --example-env ./.env.dist --parameter-path /local/app/
```

If the `.env` file does not exist, the command will error out. To allow the command to create the file, based on the example file, add the `--create-env, -c` flag.

```bash
~ parameterstore-env-sync --parameter-path /local/app/ --create-env
```

If a value has been set in the `.env` file, the command will not attempt to update it with a different value from the example env or from AWS Parameter Store. To force values to be updated, add the `--force-update-all, -f` flag.

```bash
~ parameterstore-env-sync --parameter-path /local/app/ --force-update-all
```

To skip any syncing with the example env file, and only run the AWS Parameter Store sync, add the `--skip-example, -s` flag.

```bash
~ parameterstore-env-sync --parameter-path /local/app/ --skip-example
```

### Flag Reference

| Flag             | Short | Required | Default        | Description                                                                                                                                                                                            |
|------------------|-------|----------|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| --env            | -e    | no | ./.env         | Location of the env file to write to from current dir                                                                                                                                                  |
| --example-env    | -x    | no | ./.env.example | Location of the example env file to sync new vars from into the .env                                                                                                                                   |
| --parameter-path | -p    | yes |  | AWS Parameter Store path that prepends all values to load ([AWS: Working with parameter hierarchies](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-paramstore-hierarchies.html)) |
| --create-env     | -c    | no | false | If the env file does not exist, the command will create it by copying the example env file                                                                                                             |
| --skip-example   | -s    | no | false | Will not read the example env file to attempt a sync between it and the env file                                                                                                                       |
| --force-update-all  | -f    | no | false | Enabling will overwrite any set values in the env file, unless the line ends with #do-not-overwrite                                                                                                    |

### Skip a Forced Update

Using the `--force-update-all` flags overwrites a set value in the env, **unless** the line in the env file ends with #do-not-overwrite

```bash
SOME_API_KEY=xx-custom-value-xx  #do-not-overwrite
```

## Add to package.json Scripts

```js
// package.json
{
  "scripts": {
    "sync-env": "parameterstore-env-sync -p /local/app/ -c",
    "sync-env:force-update": "npm run sync-env -- --force-update-all"
  }
}
```

## Select AWS Account Profile

If you have multiple AWS account profiles to access, the command run would need to be piped through some tool to load the proper environment.

I recommend [aws-vault](https://github.com/99designs/aws-vault).

With the above configuration, executing the command looks more like:

```bash
~ aws-vault exec shared-nonprod-profile -- npm run sync-env 
 
 or 
 
~ aws-vault exec shared-nonprod-profile -- parameterstore-env-sync -p /local/app/
```

## License
This project is licensed under [MIT](./LICENSE)