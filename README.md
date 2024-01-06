# Trading

## Overview

## Configuration

This application can be configured to interact with:

The mainnet

To configure between these, set the `Environment` to the correct environment in the [example configuration](./src/config.ts) file.

The configuration includes control of the environment as well as inputs to the example's functionality. The rest of the code should need no modification to function.

## Setup

### Install dependencies

1. Run `yarn install` to install the project dependencies
2. Run `yarn install:chain` to download and install Foundry

### Get a mainnet RPC URL

1. Create an API key using any of the [Ethereum API providers](https://docs.ethers.io/v5/api/providers/) and grab the respective RPC URL, eg `https://mainnet.infura.io/v3/0ac57a06f2994538829c14745750d721`
2. Set that as the value of the `mainnet` `rpc` value inside the [config](./src/config.ts).

### Start the web interface

Run `yarn start` and navigate to [http://localhost:3000/](http://localhost:3000/)
