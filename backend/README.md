# Developing locally with the backend 
![Backend CI](https://github.com/unsw-cse-comp3900-9900/capstone-project-good-vibes-only/workflows/Backend%20CI/badge.svg)

## Setting up

To get started working on the backend on you local machine you will need
to install the following tools:

 * [Google Cloud SDK](https://cloud.google.com/sdk/docs/quickstarts)
 * [Node.js and `npm`](https://github.com/nodesource/distributions/blob/master/README.md)

## Initialising the Google Cloud SDK

Once the Google Cloud SDK is installed you will need to initialise it
and set the default package.

You simply need to run `gcloud init` to initialise the SDK. It will
prompt you to log in and select your default project. The default
project should be `campus-app-270001`.

You will also need to run the following:

```bash
gcloud components install cloud-firestore-emulator
```

## Installing the Node.js dependencies

You will need to install all of the dependencies for the node server
before running the server locally. To do that, simply run the following
command in the same directory as the server code.

```bash
npm install
```

## Using the back-end server locally

The 'production' server would normally be started with `npm start`.
Running the server in this manner will connect it to the database and
access all of the primary data.

The Google Cloud SDK provides an emulator that can be used in place of
an actual firestore database.

To start the emulator running in the background run the following:

```bash
source <(./firestore.py)
```

To stop the emulator at any time run the following:

```bash
./firestore.py stop
```

When running the server for testing purposes you should use the
following command, which will use the emulated database. 

```bash
# itest is short for 'interactive test'
npm run itest
```

With this server running it will start an interactive
[GraphIQL](https://github.com/graphql/graphiql) interface which you can
use to query the server manually and navigate its API from
[`http://localhost:8080/api`](http://localhost:8080/api).

## Running tests on the back-end code

Tests for the back-end code are written in the `*.ts` files in the `test`
directory. To run all of the tests in this directory use the following
command:

```bash
npm run test
```

These tests will be run against the emulated database.

## Writing and committing code

All of the code committed to back end will be expected to pass the above
the above tests before being committed to master. All code will also be
checked to ensure it passes the
[linting](https://palantir.github.io/tslint/) rules in `tslint.json`.

You can run the linter locally to check your code before making a commit
with:

```bash
npm run lint
```

The linting tool is also able to automatically fix a large number of
common issues. You can get the linter to clean up your code with the
following command:

```bash
npm run fix
```
