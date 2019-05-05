# App

## Docs

Configure app and run `npm run spa` to get to docs.

## Configuration

After checkout of a repository, please perform the following steps in exact sequence:

1. Copy docker-compose.override
    ```
    $ cp docker-compose.override.yml.dist docker-compose.override.yml
    ```
2. Run `npm run docker-build`

3. Run watch - `npm run watch`

## IDE autocomplete

In order to have autocomplete in IDE you should install node_modules locally.

1. Configure app by performing steps above.

2. Run `npm i`

## Dev setup

This app is fully dockerized, so in order to use it you have to have docker and docker-compose installed. What's more you need to have npm in order to run npm scripts.

1. In order to run the whole app type:

    ```
    npm run gateway
    ```

2. In order to watch files for dev purpose type:

    ```
    npm run watch
    ```

3. If you need to close all containers run:

    ```
    npm run down
    ```
## SPA

```
npm run spa
```

## Code style

We're using Prettier and TSLint to keep code clean. In order to reformat/check code run:

```
npm run tslint
npm run prettier
```

##Tests

There are two types of tests:

- integration: `npm run integration`
- units: `npm run units`