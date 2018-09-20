import {getWeb3, DECIMAL_FACTOR, getErc20At, getAllowance, promisify,
  getReceipt, getDefaultTransObj, publishTokenMutation,
  isTransEnabled} from './Core'
import {NumberEntryGroupExt} from './NumberEntryGroupRo'
import React, {Component} from 'react'

const web3 = getWeb3()
const web3utils = web3._extend.utils

export default class Approval extends Component {

  constructor(props) {
    super(props)
    this.state = {allowance: 0, request: 0}
  }

  async componentDidMount() {
     await this.updateAllowance()
  }

  async updateAllowance() {
    if (isTransEnabled()) {
      let allowance =  await getAllowance(this.props.token, this.props.targetContract)
      this.setState({allowance: allowance, request: allowance})
    } else {
      this.setState({allowance: 0})
    }
    console.log("updateAllowance", this.state)
  }


  async approve(amount) {
    let erc20Token = await getErc20At(this.props.token)
    let transObj = await getDefaultTransObj()
    let trans = await promisify(cb => erc20Token.approve(this.props.targetContract,
      web3utils.toBigNumber(amount).mul(DECIMAL_FACTOR).toFixed(),
      transObj, cb))
    await getReceipt(trans)
    await  this.updateAllowance()
    publishTokenMutation([this.props.token])
  }

  render () {
    if (this.state.allowance !== null) {
      return (
        <NumberEntryGroupExt label={`Allowed ${this.state.allowance}`} button="Approve" 
        onChange={(v) => this.setState({request: v})}
        value ={this.state.request} onClick={() => this.approve(this.state.request) }/>
      )
    }
    return <div>Loading...</div>
  }
}
