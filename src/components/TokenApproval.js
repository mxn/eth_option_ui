import React, { Component } from 'react'
import OptionTableEntry from './OptionTableEntry'
import {getBalance, promisify, getContractInstance, jsonOptionFactory} from './Core.js'


class TokenApproval extends Component {
 constructor(props) {
    super(props)
    this.state = {
      approved: 0,
      toApprove: 0,
      targetContract: "",
      token:  ""
    }

    this.handleValueChange = this.handleValueChange.bind(this)
    this.handleBtnClick = this.handleBtnClick.bind(this)
  }

  async getAllowance() {
    console.log("allowance token:" + this.state.token)
    console.log("allowance target:" + this.state.targetContract)
    let erc20Token = await erc20.at(this.state.token)
    let allowanceBN = await erc20Token.allowance.call( web3.eth.accounts[0], this.state.targetContract)
    console.log("allowance amount: " + allowanceBN)
    return allowanceBN.dividedBy(DECIMAL_FACTOR).toFixed()
  }

  async componentWillMount() {
    this.setState({
      targetContract: await this.props.targetContract,
      token: await this.props.token})
    let approved =  await this.getAllowance()
    this.setState({approved: approved, toApprove: approved})
  }

  async getDerivedStateFromProps(nextProps, prevState) {
    return {
      targetContract: await nextProps.targetContract,
      token: await nextProps.token
    }
  }

  handleValueChange(ev) {
    this.setState({toApprove: ev.target.value})
  }

  async handleBtnClick(ev) {
      console.log(await this.props.targetContract)
      console.log(this.state)
      let erc20Token = await erc20.at(this.state.token)
      await erc20Token.approve(this.state.targetContract,
        web3utils.toBigNumber(this.state.toApprove).mul(DECIMAL_FACTOR),
        {from: web3.eth.accounts[0]})
  }

  render() {
    console.log("token in render")
    console.log(this.state.token)
    return (
      <div>
      <div className="row">

        {"hello: " + this.state.token}
      </div>
      <div className="row">
        {this.state.targetContract}
      </div>
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">
            Approved: {this.state.approved}
          </span>
        </div>
        <input id="noOptionsToWrite" type="number"
          className="form-control input-group-addon"
          value={this.state.toApprove} onChange={this.handleValueChange}/>
        <button id="btnWrite" className="btn btn-primary input-group-append"
          onClick={this.handleBtnClick}>Approve</button>
      </div>
      </div>
    )}

}
