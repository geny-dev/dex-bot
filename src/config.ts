import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'

import { USDC_TOKEN, WETH_TOKEN } from './libs/constants-goerli'

// Sets if the example should run locally or on chain
export enum Environment {
  LOCAL,
  MAINNET,
  WALLET_EXTENSION,
}

// Inputs that configure this example to run
export interface ExampleConfig {
  env: Environment
  rpc: {
    local: string
    mainnet: string
  }
  wallet: {
    address: string
    privateKey: string
  }
  tokens: {
    in: Token
    out: Token
  }
  poolFee: number
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  env: Environment.MAINNET,
  rpc: {
    local: '',
    mainnet: 'https://goerli.infura.io/v3/1f9d41fb157f488bba1cc380bc178d0d',
  },
  wallet: {
    address: '0xecAf39B797EE134C04dc7a739cdE398Bd76707d0',
    privateKey:
      '0xf0f785ffce65b6542ee479591caf626f1a655a2f96d3738993ad167cb8693ec1',
  },
  tokens: {
    in: WETH_TOKEN,
    out: USDC_TOKEN,
  },
  poolFee: FeeAmount.MEDIUM,
}
