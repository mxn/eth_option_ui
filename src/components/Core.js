import * as Web3 from 'web3'
import PubSub from 'pubsub-js'

const Contract = require('truffle-contract')
const jsonOptionFactory = require("solidity-contracts/OptionFactory.json")
const jsonWeth = require("solidity-contracts/Weth.json")
const jsonDai = require("solidity-contracts/DAI.json")
const jsonERC20 = require("solidity-contracts/ERC20.json")
const jsonTokenOption = require("solidity-contracts/TokenOption.json")
const jsonTokenAntiOption = require("solidity-contracts/TokenOption.json")
const jsonOptionPair = require("solidity-contracts/OptionPair.json")
const jsonFeeCalculator = require("solidity-contracts/IFeeCalculator.json")
const jsonRequestHandler = require("solidity-contracts/OSDirectRequestHandler.json")
const jsonOptionSerieToken = require("solidity-contracts/OptionSerieToken.json")
const jsonExchangeAdapterOasisImpl = require("solidity-contracts/ExchangeAdapterOasisImpl.json") 

export const TOPIC_AFFECTED_BALANCES = 'affected_balances'

var web3, erc20

const kovanDaiAddress = "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"

const tokenToNames = {
  //TODO addresses from mainnet and testnet
}

export const getWeb3 = () => {
  if (web3) {
    return web3
  }
  if (window.hasOwnProperty('web3')) {
    web3 =  new Web3(window.web3.currentProvider)
    console.log('use current provider')
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io"))
    console.log('use fallback HttpProvider')
  }
  return web3
}

export const isTransEnabled = () => {
  return window.hasOwnProperty('web3') && web3.eth.accounts.length > 0
}

const getErc20 = () => {
  erc20 = Contract(jsonERC20)
  erc20.setProvider(web3.currentProvider)
  return erc20
}


export const web3utils = getWeb3()._extend.utils

const TOKEN_DIGITS = 18
export const DECIMAL_FACTOR = web3utils.toBigNumber(10).toPower(TOKEN_DIGITS)

export const promisify = (inner) => {
  return new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
        resolve(res);
      })
    );
}

export const getContractInstance = async(json, address) => {
  let contract = getWeb3().eth.contract(json.abi)
  if (address) {
    return contract.at(address)
  }
  let truffleContract = Contract(json)
  await truffleContract.setProvider(getWeb3().currentProvider)
  let deployedAddress = (await truffleContract.deployed()).address
  return contract.at(deployedAddress)
}

export const getNetworkId = () => {
  return  promisify(cb => getWeb3().version.getNetwork(cb))
}

export const getNetworkName = async () => {
  switch (Number(await getNetworkId())) {
    case 1: return "main"
    case 3: return "ropsten"
    case 42: return "kovan"
    default: return "unknown development"
  }
}

export const  getEtherscanHost = async () => {
  switch (Number(await getNetworkId())) {
    case 1: //ropsten
      return "etherscan.io"
    case 3: //ropsten
      return "ropsten.etherscan.io"
    case 42: //kovan
      return "kovan.etherscan.io"
    default:
      return null
    }
}

export const  getWethInstance =  async () => {
  let netId = await getNetworkId()
  //console.log(netId)
  switch (Number(netId)) {
    case 3: //ropsten
      return getContractInstance(jsonWeth, "0xc778417e063141139fce010982780140aa0cd5ab")
    case 42: //kovan
      return getContractInstance(jsonWeth, "0xd0a1e359811322d97991e03f863a0c30c2cf029c")
    default:
      return getContractInstance(jsonWeth)
  }
}

export const getDaiInstance = async () => {
  let netId = await getNetworkId()
  //console.log(netId)
  switch (Number(netId)) {
    case 42: //kovan
      return getContractInstance(jsonDai, kovanDaiAddress)
    default:
      return getContractInstance(jsonDai)
  }
}

export const  getAccount = async () => {
  let accounts =  await promisify(cb=>getWeb3().eth.getAccounts(cb))
  if (accounts === null || accounts === undefined || accounts.length === 0) {
    return null
  }
  return accounts[0]
}

export const getErc20At = async (token) => {
  return getContractInstance(jsonERC20, token)
}

export const getFeeCalculatorAt = async (calcAddress) => {
  return getContractInstance(jsonFeeCalculator, calcAddress)
}

export const getOptionFactoryInstance = async () => {
  let netId = await getNetworkId()
  //console.log(netId)
  switch (Number(netId)) {
    case 3: //ropsten
      return getContractInstance(jsonOptionFactory, "0xb7b68150022054daf980461a99d19d807afa8ca0")
    case 42: //kovan
      return getContractInstance(jsonOptionFactory, "0x7a2637f799e183e276cc077c300bbff6f78df075")
    default:
      return getContractInstance(jsonOptionFactory)
    }
}

export const getRequestHandlerInstance = async () => {
  let netId = await getNetworkId()
  switch (Number(netId)) {
    case 42: //kovan
      return getContractInstance(jsonRequestHandler, "0x80f9d6fb9b6d539f5a48fa27404e82e97d532ef4")
    default:
      return getContractInstance(jsonRequestHandler)
    }
}

export const getExchangeAdapterAddress = async () => {
  let exchangeAdapter = await getContractInstance(jsonExchangeAdapterOasisImpl)
  return exchangeAdapter.address
}

export const getExchangeAdapter = () => 
  getContractInstance(jsonExchangeAdapterOasisImpl)

export const getDefaultFeeCalculatorAddress = async () => {
  let optFactory = await getOptionFactoryInstance()
  console.log (optFactory);
  return promisify((cb) => optFactory.feeCalculator(cb))
}

export const getOptionPairInstance = (address) => {
  return getContractInstance(jsonOptionPair, address)
}

export const getTokenOptionInstance = (address) => {
  return getContractInstance(jsonTokenOption, address)
}

export const getTokenAntiOptionInstance = (address) => {
  return getContractInstance(jsonTokenAntiOption, address)
}

export const getFeeCalculatorInstance = (address) => {
  return getContractInstance(jsonFeeCalculator, address)
}

export const getOptionSerieToken = () => {
  return getContractInstance(jsonOptionSerieToken)
}

export const onMined = (transNo, callback)  => {
  let filter = web3.eth.filter("latest")
  filter.watch( async (e, d) => {
      if (!e) {
        const rec = await promisify(cb => web3.eth.getTransactionReceipt(transNo, cb))
        if (rec != null) {
          //console.log("blockNumber: " + rec.blockNumber)
          //console.log("receipt: " + JSON.stringify(rec))
          filter.stopWatching()
          callback()
        }
      } else {
        console.error("error: " + e);
      }
    })
}

export const getEthBalance = async () => {
  let account = await getAccount()
  return promisify(cb => web3.eth.getBalance(account, cb))
}

export const getBalance = async (token, accountOf) => {
    let erc20 = await getErc20At(token)
    let account = accountOf || (await getAccount())
    try {
      const balBigNumber = await promisify(cb =>  erc20.balanceOf(account, cb))
      return balBigNumber.dividedBy(DECIMAL_FACTOR).toNumber()
    } catch (e) {
      return 0
    }
}

export const getAllowance = async (token, targetContract) => {
  try {
    const balBigNumber = await (await getErc20()).at(token).allowance(web3.eth.accounts[0], targetContract)
    return balBigNumber.dividedBy(DECIMAL_FACTOR).toFixed()
  } catch (e) {
    return 0
  }

}

export const setStatePropFromEvent = (ev, objToSet) => {
  var obj = {}
  obj[ev.target.id] = ev.target.value
  objToSet.setState(obj)
}

const initTokenNames = async () => {
      tokenToNames[(await getWethInstance()).address] = "WETH"
      tokenToNames[(await getDaiInstance()).address] = "MockDAI"
      tokenToNames[kovanDaiAddress] = "DAI"
}


initTokenNames()

export const getTokenName = (token) => {
  return tokenToNames[token]
}

export const getDisplayTokenName = (tokenAddress) => {
  let tokenName = getTokenName(tokenAddress)
  return tokenName ? `${tokenName} (${tokenAddress})` : tokenAddress
}

export const getReceipt = (transNo) => {
  return new Promise ((resolve, reject) => {
    let filter = web3.eth.filter("latest")
    filter.watch( async (e, d) => {
        if (!e) {
          web3.eth.getTransactionReceipt(transNo,
            (e, rec) => {
              if (e) {
                filter.stopWatching()
                reject(e)
              }
              if (rec != null) {
                filter.stopWatching()
                resolve(d)
              }
            })
        } else {
          filter.stopWatching()
          reject(e)
        }
      })
  })
}

const MAX_DIGITS = 9

export const isCloseToLimit  =  (val, limit) => {
  let epsilon = web3utils.toBigNumber(10).pow(TOKEN_DIGITS - MAX_DIGITS)
  return val.minus(limit).abs().comparedTo(epsilon) < 0
}

const getAffectedBalanceMsgData = (tokens) => {
  return tokens.reduce((prev, elt) => {
      prev[elt] = true
      return prev}, {})
}

export const publishTokenMutation = (tokens) => {
  PubSub.publishSync(TOPIC_AFFECTED_BALANCES, getAffectedBalanceMsgData(tokens))
}

export const getGasPrice = ()  => {
  return promisify(cb => web3.eth.getGasPrice(cb))
}

export const getDefaultTransObj = async (val) => {
  let gasPrice = await promisify(cb => web3.eth.getGasPrice(cb))
  let from = await getAccount()
  if (val === undefined) {
    return {from: from, gasPrice: gasPrice}
  }
  return {from: from, value: val, gasPrice: gasPrice}
}

//export const getWeb3CallPromise = (fn) => promisify(cb => fn(cb))
