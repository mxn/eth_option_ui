import {
  getBalance, getWethInstance,
  getDaiInstance
} from './Core'



export const dumpValues = async () => {
  let weth = await getWethInstance()
  let dai = await getDaiInstance()
  let wethBal = await getBalance(weth.address, mockOasisDirect.address)
  let daiBal = await getBalance(dai.address, mockOasisDirect.address)
  console.log("balances", [wethBal, daiBal])
}