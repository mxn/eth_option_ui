import {getRequestHandlerInstance, getDefaultFeeCalculatorAddress, getDefaultTransObj, getReceipt, promisify} from './Core.js'

export const createOptionLine = async (underlying, basis, strike, underlyingQty, expireDate) => {
      let reqHandler = await getRequestHandlerInstance()
      let transObj = await getDefaultTransObj()
      let feeCalcAddress = await getDefaultFeeCalculatorAddress()
      let trans = await promisify(cb => reqHandler.requestOptionSerie(underlying, basis,
          strike, underlyingQty,
          expireDate / 1000, feeCalcAddress,
          transObj, cb))
      await getReceipt(trans)
}