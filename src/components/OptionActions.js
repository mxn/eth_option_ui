import {getBalance, getOptionFactoryInstance,
  getOptionPairInstance, DECIMAL_FACTOR, getReceipt, TOPIC_AFFECTED_BALANCES,
  publishTokenMutation, web3utils, getTokenOptionInstance,
  isCloseToLimit, promisify, getDefaultTransObj}  from './Core'

import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import {DropdownButton, MenuItem, FormGroup, InputGroup, FormControl} from 'react-bootstrap'

const WRITE = "WRITE", ANNIHILATE = "ANNIHILATE", EXERCISE="EXERCISE", WITHDRAW="WITHDRAW"

const publishOptionMutation = async (optionPairAddress) => {
  let optionPair = await getOptionPairInstance(optionPairAddress)
  publishTokenMutation([await promisify(cb => optionPair.underlying(cb)),
     await promisify(cb => optionPair.basisToken(cb)),
     await promisify(cb => optionPair.tokenOption(cb)),
     await promisify(cb => optionPair.tokenAntiOption(cb))
   ])
}

export default class OptionActions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      value: 0,
      availableActions: []}
  }

  async getAvailableActions() {
    let optionPair = await getOptionPairInstance(this.props.optionPairAddress)
    var expireTime, underlyingBalance, basisBalance, optionBalance, antiOptionBalance
     [expireTime, underlyingBalance, basisBalance, optionBalance, antiOptionBalance] =
      [await promisify(cb => optionPair.expireTime.call(cb)),
      await getBalance(await promisify(cb => optionPair.underlying.call(cb))),
      await getBalance(await promisify(cb => optionPair.basisToken.call(cb))),
      await getBalance(await promisify(cb => optionPair.tokenOption.call(cb))),
      await getBalance(await promisify(cb => optionPair.tokenAntiOption.call(cb)))]
    return Object.keys(this.actions)
      .filter((action) => {
         switch(action) {
           case WITHDRAW:
            return (new Date()) > expireTime * 1000
           default:
            return (new Date()) < expireTime * 1000
         }
       })
       .filter((action) => {
         switch(action) {
           case WRITE:
            return underlyingBalance > 0
           case EXERCISE:
            return optionBalance > 0 && basisBalance > 0
           case ANNIHILATE:
            return optionBalance > 0 && antiOptionBalance > 0
           case WITHDRAW:
            return antiOptionBalance > 0
           default:
            throw new Error (`Unknown action ${action}`)
         }
       })
  }

  async onSelect(ek) {
    this.setState({isLoading: true})
    console.log(this.actions)
    console.log(this.actions[ek])
    let trans = await this.actions[ek].bind(this)()
    await getReceipt(trans)
    publishOptionMutation(this.props.optionPairAddress)
    this.setState({isLoading: false, value: 0})
  }

  async writeOptions() {
    let optionFactory = await getOptionFactoryInstance()
    let transObj = await getDefaultTransObj()
    return promisify(cb => optionFactory.writeOptions(this.props.optionPairAddress,
      web3utils.toBigNumber(this.state.value).mul(DECIMAL_FACTOR),
        transObj, cb))
  }

  async annihilateOptions() {
    let optionPair = await getOptionPairInstance(this.props.optionPairAddress)
    let transObj = await getDefaultTransObj()
    return promisify(cb => optionPair.annihilate(
         DECIMAL_FACTOR.mul(this.state.value), transObj, cb))
  }

  async withdrawOptions() {
    let optionPair = await getOptionPairInstance(this.props.optionPairAddress)
    let transObj = await getDefaultTransObj()
    return promisify(cb => optionPair.withdrawAll(transObj, cb))
  }

  async exerciseOptions() {
    let optionFactory = await getOptionFactoryInstance()
    let optionPair = await getOptionPairInstance(this.props.optionPairAddress)
    let tokenOptionAddress = await promisify(cb => optionPair.tokenOption.call(cb))
    let tokenOption = await getTokenOptionInstance(tokenOptionAddress)
    let balanceTokenOption = await getBalance(tokenOption.address)
    let isCloseToBalance = isCloseToLimit(DECIMAL_FACTOR.mul(this.state.value), balanceTokenOption)
    let transObj = await getDefaultTransObj()
    if (isCloseToBalance) {
      return promisify(cb => optionFactory.exerciseAllAvailableOptions(this.props.optionPairAddress,
         transObj, cb))
    }
    return promisify(cb => optionFactory.exerciseOptions(this.props.optionPairAddress,
        DECIMAL_FACTOR.mul(this.state.value), transObj, cb))
  }

  async componentWillMount() {
    this.actions = {WRITE: this.writeOptions,
        EXERCISE: this.exerciseOptions,
        WITHDRAW: this.withdrawOptions,
        ANNIHILATE: this.annihilateOptions}
    this.actionToLabel = Object.keys(this.actions)
      .reduce((prev, el) => {prev[el] =  el.substring(0,1) + el.substring(1).toLowerCase(); return prev}, {})
    this.actionToLabel["Withdraw"] = "Withdraw All"
      this.setState({availableActions: await this.getAvailableActions()})
  }

  async componentDidMount() {
    this.subscriber = PubSub.subscribe(TOPIC_AFFECTED_BALANCES,
      async () => this.setState({availableActions:
        await this.getAvailableActions()}))
  }

  async componentWillUnmount() {
    this.subscriber = PubSub.unsubscribe(TOPIC_AFFECTED_BALANCES)
  }


  render () {
    return (
      <FormGroup>
       <InputGroup>
         <FormControl type="number" value={this.state.value} onChange={(ev) => this.setState({value: ev.target.value})}/>
           <DropdownButton
             componentClass={InputGroup.Button} bsStyle={this.state.isLoading ? "warning" : "success"}
             id={`dropdown_${this.props.optionPairAddress}`}
             key={`dropdown_${this.props.optionPairAddress}`}
             onSelect={(eventKey) => this.onSelect(eventKey)}
             disabled = {this.state.value === 0 ||
               this.state.availableActions.length === 0}
             title={this.state.isLoading ?  "Processing" : "Action"}>
             {this.state.availableActions.map((key, i) => {
               return <MenuItem key={"mu_" + i} eventKey={key}>{this.actionToLabel[key]}</MenuItem>
             })}
           </DropdownButton>
       </InputGroup>
      </FormGroup>)
  }
}
