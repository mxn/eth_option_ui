import {getNetworkName, promisify} from './Core'
import * as request from 'request'

//TODO: fix Quick and Dirty
export const getOptionTable = async () => {
  let networkName = await getNetworkName()
  let cacheServiceUrl = `https://erc20-options.appspot.com/api/ethevents/${networkName}/OptionFactory/OptionTokenCreated/events`
  let res = await promisify(cb => request(cacheServiceUrl, cb))
  let resParsed = JSON.parse(res.body)
  resParsed.forEach(element => {
    ["expireTime", "strike", "underlyingQty"].forEach(prop => element[prop] = parseInt(element[prop], 0))
  })
  resParsed = resParsed.filter(o => o.strike > 0 && o.underlyingQty > 0)
  return resParsed
}
