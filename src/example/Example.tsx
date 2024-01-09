import './Example.css'

import React, { useCallback, useEffect, useState } from 'react'

import { CurrentConfig, Environment } from '../config'
import { USDC_TOKEN, WETH_TOKEN } from '../libs/constants-goerli'
import {
  connectBrowserExtensionWallet,
  getProvider,
  getWalletAddress,
  TransactionState,
} from '../libs/providers'
import { createTrade, executeTrade, TokenTrade } from '../libs/trading'
import { displayTrade } from '../libs/utils'
import { getCurrencyBalance, wrapETH } from '../libs/wallet'

const useOnBlockUpdated = (callback: (blockNumber: number) => void) => {
  useEffect(() => {
    const subscription = getProvider()?.on('block', callback)
    return () => {
      subscription?.removeAllListeners()
    }
  })
}

const Example = () => {
  const [trade, setTrade] = useState<TokenTrade>()
  const [isBotRunning, setBotRunning] = useState<boolean>(false)
  const [statusString, setStatusString] = useState<string>()

  const [txState, setTxState] = useState<TransactionState>(TransactionState.New)
  const [tokenInBalance, setTokenInBalance] = useState<string>('0')
  const [tokenOutBalance, setTokenOutBalance] = useState<string>()
  const [blockNumber, setBlockNumber] = useState<number>(0)
  const [seconds, setSeconds] = useState<number>(0)

  // Listen for new blocks and update the wallet
  useOnBlockUpdated(async (blockNumber: number) => {
    refreshBalances()
    setBlockNumber(blockNumber)
  })

  // Update wallet state given a block number
  const refreshBalances = useCallback(async () => {
    const provider = getProvider()
    const address = getWalletAddress()
    if (!address || !provider) {
      return
    }

    setTokenInBalance(
      await getCurrencyBalance(provider, address, CurrentConfig.tokens.in)
    )
    setTokenOutBalance(
      await getCurrencyBalance(provider, address, CurrentConfig.tokens.out)
    )
  }, [])

  // Event Handlers

  const onConnectWallet = useCallback(async () => {
    if (await connectBrowserExtensionWallet()) {
      refreshBalances()
    }
  }, [refreshBalances])

  const onCreateTrade = useCallback(async () => {
    await refreshBalances()
    const amountIn =
      (Math.random() * 0.3 + (1 - Math.random()) * 0.7) *
      parseFloat(tokenInBalance)
    setTrade(await createTrade(amountIn))
  }, [tokenInBalance, refreshBalances])

  const onTrade = useCallback(async (trade: TokenTrade | undefined) => {
    if (trade) {
      setTxState(await executeTrade(trade))
    }
  }, [])

  const createRandomPair = useCallback(() => {
    const type = Math.floor(Math.random() * 3)
    if (type == 0) {
      CurrentConfig.tokens.in = USDC_TOKEN
      CurrentConfig.tokens.out = WETH_TOKEN
    } else {
      CurrentConfig.tokens.in = WETH_TOKEN
      CurrentConfig.tokens.out = USDC_TOKEN
    }
  }, [])

  const onRunBot = useCallback(async () => {
    if (isBotRunning) {
      setBotRunning(false)
      setStatusString('Dex Bot Stopped')
    } else {
      setBotRunning(true)
      setStatusString('Dex Bot Started')
    }
  }, [isBotRunning, setBotRunning, setStatusString])

  useEffect(() => {
    let intervalId: NodeJS.Timer

    if (isBotRunning) {
      if (seconds > 0) {
        intervalId = setInterval(() => {
          setStatusString(`Next Dex Bot is starting in ` + seconds + ` secs...`)
          setSeconds(seconds - 1)
        }, 1000)
      }
      if (seconds == 0) {
        const count = Math.floor(Math.random() * 10) + 15
        setSeconds(count)
        createRandomPair()
      } else if (seconds == 15) {
        onCreateTrade()
        onTrade(trade)
      }
    }

    return () => clearInterval(intervalId)
  }, [isBotRunning, seconds, trade, onCreateTrade, onTrade, createRandomPair])

  return (
    <div className="App">
      {CurrentConfig.rpc.mainnet === '' && (
        <h2 className="error">Please set your mainnet RPC URL in config.ts</h2>
      )}
      {CurrentConfig.env === Environment.WALLET_EXTENSION &&
        getProvider() === null && (
          <h2 className="error">
            Please install a wallet to use this example configuration
          </h2>
        )}
      <h3>{trade && `Constructed Trade: ${displayTrade(trade)}`}</h3>
      <button
        onClick={() => onRunBot()}
        disabled={
          getProvider() === null ||
          CurrentConfig.rpc.mainnet === '' ||
          tokenInBalance == undefined ||
          tokenInBalance == undefined
        }>
        <p>{isBotRunning ? 'Stop Bot' : 'Start Bot'}</p>
      </button>
      <p>{statusString}</p>
      <button onClick={onCreateTrade}>
        <p>Create Trade</p>
      </button>
      <h3>{`Wallet Address: ${getWalletAddress()}`}</h3>
      {CurrentConfig.env === Environment.WALLET_EXTENSION &&
        !getWalletAddress() && (
          <button onClick={onConnectWallet}>Connect Wallet</button>
        )}
      <h3>{`Block Number: ${blockNumber + 1}`}</h3>
      <h3>{`Transaction State: ${txState}`}</h3>
      <h3>{`${CurrentConfig.tokens.in.symbol} Balance: ${tokenInBalance}`}</h3>
      <h3>{`${CurrentConfig.tokens.out.symbol} Balance: ${tokenOutBalance}`}</h3>
      <button
        onClick={() => wrapETH(100)}
        disabled={getProvider() === null || CurrentConfig.rpc.mainnet === ''}>
        <p>Wrap ETH</p>
      </button>
      <button
        onClick={() => onTrade(trade)}
        disabled={
          trade === undefined ||
          txState === TransactionState.Sending ||
          getProvider() === null ||
          CurrentConfig.rpc.mainnet === ''
        }>
        <p>Trade</p>
      </button>
    </div>
  )
}

export default Example
