import {getWeb3, DECIMAL_FACTOR, getErc20At, getAllowance, promisify,
  getReceipt, getDefaultTransObj, publishTokenMutation,
  isTransEnabled} from './Core'
import NumberEntryGroup from './NumberEntryGroup'
import React, {Component} from 'react'

const web3 = getWeb3()
const web3utils = web3._extend.utils

export default class Approval extends Component {

  constructor(props) {
    super(props)
    this.state = {allowance: null}
  }

  async componentWillMount() {
     await this.updateAllowance()
  }

  async updateAllowance() {
    if (isTransEnabled()) {
      this.setState({allowance:
        await getAllowance(this.props.token, this.props.targetContract)})
    } else {
      this.setState({allowance: 'N/A'})
    }
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
    if (this.state.allowance) {
      return (
        <NumberEntryGroup label={`Allowed ${this.state.allowance}`} button="Approve" value={this.state.allowance} onClick={(v) => this.approve(v) }/>
      )
    }
    return <div>Loading...</div>
  }
}
