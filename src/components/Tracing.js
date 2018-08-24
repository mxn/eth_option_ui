import {
  getBalance, getContractInstance, getWethInstance,
  getDaiInstance
} from './Core'

const jsonMockOasisDirect = require("solidity-contracts/MockOasisDirect.json") 


export const dumpValues = async () => {
  let mockOasisDirect = await getContractInstance(jsonMockOasisDirect)
  console.log("mockOasisDirect.address", mockOasisDirect.address)
  let weth = await getWethInstance()
  let dai = await getDaiInstance()
  let wethBal = await getBalance(weth.address, mockOasisDirect.address)
  let daiBal = await getBalance(dai.address, mockOasisDirect.address)
  console.log("balances", [wethBal, daiBal])
  
}