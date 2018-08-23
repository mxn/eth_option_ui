import {promisify, setStatePropFromEvent,
  getWethInstance, getWeb3, getReceipt, TOPIC_AFFECTED_BALANCES, isTransEnabled,
  publishTokenMutation, getBalance, getEthBalance, getAccount, getDefaultTransObj} from './Core'
import TransactionStatus from './TransactionStatus'
import NumberEntryGroup from './NumberEntryGroup'

import PubSub from 'pubsub-js'
import React, { Component } from 'react'
import {Grid, Row, Col, Table} from 'react-bootstrap'

export default class WethConvertor extends Component {
  constructor(props, context) {
    super(props)
    this.web3 = getWeb3()
    this.web3utils = this.web3._extend.utils
    this.state = {
      currentBalanceEth: 0,
      currentBalanceWeth: 0,
      convertEthAmount: 0.0,
      account: null
    }
  }

  async componentDidMount() {
    this.handleEvents = this.handleEvents.bind(this)
    let wethInstance = await getWethInstance()
    if (!isTransEnabled()) {
      return
    } 
    this.setState({account: await getAccount()})
    this.refreshBalances()
    this.subscriber = PubSub.subscribe(TOPIC_AFFECTED_BALANCES,
      (msg, data) => {
        if (data[wethInstance.address]) {
          this.refreshBalances()
        }
      }
    )
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.subscriber)
  }

  async refreshBalances() {
    let wethInstance = await getWethInstance()
    const balEth = await getEthBalance()
    console.log("balEth", balEth)
    console.log("acc", this.state.account)
    this.setState({currentBalanceEth: this.web3utils
      .toDecimal(this.web3utils.fromWei(balEth,"ether"))})
    this.setState({currentBalanceWeth:
      await getBalance(wethInstance.address)})
 }

 async convertEth(val) {
   let wethInstance = await getWethInstance()
   let transObject = await getDefaultTransObj(this.web3utils.toWei(val, "ether"))
   const trans = await promisify(cb => wethInstance.deposit(transObject, cb))
   this.setState({convertEthAmount: 0})
   await getReceipt(trans)
   publishTokenMutation([wethInstance.address])
 }

 async unwarpWeth(val) {
   let wethInstance = await getWethInstance()
   let transObject = await getDefaultTransObj()
   const trans = await promisify(cb => wethInstance.withdraw(
     this.web3utils.toWei(val, "ether"),
     transObject, cb))
   this.setState({convertEthAmount: 0})
   await getReceipt(trans)
   publishTokenMutation([wethInstance.address])
 }

  async handleEvents(ev) {
        setStatePropFromEvent(ev, this)
  }

  render() {
    return (
      <Grid id="wrappedEthConvertorDiv" className="show-grid">
        <Row>
          <h4>Wrap ETH</h4>
        </Row>
        <Row>
          <Col sm={6}>
            <Table striped bordered condensed>
              <thead>
                <tr>
                  <th>ETH Balance:</th>
                  <th>WETH Balance:</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{this.state.currentBalanceEth}</td>
                  <td>{this.state.currentBalanceWeth}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <TransactionStatus transactionHash={this.state.transactionHash}/>
        </Row>
        <Row>
          <Col sm={6}>
            <NumberEntryGroup label="Wrap ETH" button="-> WETH"
              onClick={v => this.convertEth(v)}
              max={this.state.currentBalanceEth}
              placeholder="Please enter amount of ETH to be converted"
            />
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <NumberEntryGroup label="Un-wrap ETH" button="-> ETH"
              onClick={v => this.unwarpWeth(v)}
              max={this.state.currentBalanceWeth}
            />
          </Col>
        </Row>
      </Grid>

    )
  }
}
