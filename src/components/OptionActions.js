import {getBalance, getOptionFactoryInstance,
  getOptionPairInstance, DECIMAL_FACTOR, getReceipt, TOPIC_AFFECTED_BALANCES,
  publishTokenMutation, web3utils, promisify, getDefaultTransObj,
  getAllowance, getFeeCalculatorInstance, getTokenName}  from './Core'

import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import {DropdownButton, MenuItem, FormGroup, InputGroup, FormControl, Modal,
  Button} from 'react-bootstrap'

const WRITE = "WRITE", ANNIHILATE = "ANNIHILATE", EXERCISE="EXERCISE", WITHDRAW="WITHDRAW"

const serieTokens = ["underlying", "basisToken", "tokenOption", "tokenAntiOption"]

export default class OptionActions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      value: 0,
      availableActions: []}
  }

  async componentWillMount() {
    this.actions = {WRITE: this.writeOptions,
        EXERCISE: this.exerciseOptions,
        WITHDRAW: this.withdrawOptions,
        ANNIHILATE: this.annihilateOptions}
    this.actionToLabel = Object.keys(this.actions)
      .reduce((prev, el) => {prev[el] =  el.substring(0,1) + el.substring(1).toLowerCase(); return prev}, {})
    await this.setAddresses()
    await Promise.all([this.setBalances(), this.setAllowances(),
      this.setOptionPairDetails()])
    this.actionToLabel["Withdraw"] = "Withdraw All"
      this.setState({availableActions: await this.getAvailableActions()})

  }

  async componentDidMount() {
    this.subscriber = PubSub.subscribe(TOPIC_AFFECTED_BALANCES,
      async () => {
        this.setState({availableAction: await this.getAvailableActions()})
        this.setBalances()
        this.setAllowances()
      })
  }

  async setAddresses() {
    let optionPair = await getOptionPairInstance(this.props.optionPairAddress)
    let addresses =  await Promise.all(serieTokens.map( (token) =>
        promisify(cb => optionPair[token].call(cb))))
    let res = {}
    serieTokens.forEach((el, i) => res[el] = addresses[i])
    this.setState({addresses: res})
  }

  async setBalances() {
    let balances = await Promise.all(Object.keys(this.state.addresses)
      .map(token =>  getBalance(this.state.addresses[token])))
    let res = {}
    serieTokens.forEach((el, i) => res[el] = balances[i])
    this.setState({balances: res})
  }

  async setAllowances() {
    let optionFactory = await getOptionFactoryInstance()
    let allowances = await Promise.all(Object.keys(this.state.addresses)
      .map(token => getAllowance(this.state.addresses[token], (token === "tokenOption" || token === "tokenAntiOption")? this.props.optionPairAddress : optionFactory.address )))
    let res = {}
    serieTokens.forEach((el, i) => res[el] = allowances[i])
    this.setState({allowances: res})
  }

  async setOptionPairDetails() {
    let optionPair = await getOptionPairInstance(this.props.optionPairAddress)
    let optionPairProps = ["strike", "underlyingQty", "expireTime"]
    let optionPairDetails = await Promise.all(optionPairProps
      .map(async prop => await promisify(cb => optionPair[prop].call(cb))))
    let res = {}
    optionPairProps.forEach((el, i) => res[el] = web3utils.toDecimal(optionPairDetails[i]))
    this.setState({optionPairDetails: res})
  }

  async getFee() {
    let amountToWrite = this.state.value * DECIMAL_FACTOR
    let optionPair = await getOptionPairInstance(this.props.optionPairAddress)
    let feeCalcAddress = await promisify(cb => optionPair.feeCalculator(cb))
    let feeCalculator = await getFeeCalculatorInstance(feeCalcAddress)
    return  promisify(cb => feeCalculator.calcFee(feeCalcAddress, amountToWrite, cb))
  }

  async getAvailableActions() {
    let optionPair = await getOptionPairInstance(this.props.optionPairAddress)
    let expireTime = await promisify(cb => optionPair.expireTime.call(cb))

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
            return true
           case EXERCISE:
            return this.state.balances.tokenOption > 0 &&
              this.state.balances.basisToken > 0
           case ANNIHILATE:
            return this.state.balances.tokenOption > 0 &&
              this.state.balances.tokenAntiOption > 0
           case WITHDRAW:
            return this.state.balances.tokenAntiOption > 0
           default:
            throw new Error (`Unknown action ${action}`)
         }
       })
  }

  async getWriteCaution() {
    var feeTokenAddress, fee
    [feeTokenAddress, fee] = await this.getFee()
    let feeDecimal = fee.dividedBy(DECIMAL_FACTOR).toNumber()
    let feeTokenName = await getTokenName(feeTokenAddress)
    let conditions = [
      [this.state.balances.underlying >= this.state.value *
        this.state.optionPairDetails.underlyingQty,
      `Not enough balance (${this.state.balances.underlying},
        need  ${this.state.value *
           this.state.optionPairDetails.underlyingQty}) of underlying`],
      [this.state.allowances.underlying >= this.state.value *
        this.state.optionPairDetails.underlyingQty,
        `Not enough allowance (${this.state.allowances.underlying}
          , need  ${this.state.value * this.state.optionPairDetails.underlyingQty})
          of underlying`]
    ]
    if (conditions.every(el => el[0])) {
      return {
        title: "Write Option",
        body: `You are about to deposit ${this.state.optionPairDetails.underlyingQty * this.state.value} underlaying and pay fee ${feeDecimal} ${feeTokenName}`
      }
    }
    return {
      title: "You cannot write requesed amount!",
      isError: true,
      body: conditions.reduce((prevString, el) => el[0]? prevString : `${prevString}${el[1]}. `, "")
    }
  }

  getAnnihilateCaution() {
    let conditions = [
      [this.state.balances.tokenOption >= this.state.value * 1.0,
      `Not enough balance (${this.state.balances.tokenOption},
        need ${this.state.value})`],
      [this.state.balances.tokenAntiOption >= this.state.value * 1.0,
        `Not enough balance (${this.state.balances.tokenAntiOption},
          need  ${this.state.value}) of Anti-Option tokens`],
      [this.state.allowances.tokenOption >= this.state.value,
        `Not enough allowance (${this.state.allowances.tokenOption}
          , need  ${this.state.value})
          of Option tokens`],
      [this.state.allowances.tokenOption >= this.state.value,
          `Not enough allowance (${this.state.allowances.tokenAntiOption}
            , need  ${this.state.value})
            of Anti-Option tokens`]
    ]
    if (conditions.every(el => el[0])) {
      return null
    }
    return {
      title: "You cannot annihilate requested amount!",
      isError: true,
      body: conditions.reduce((prevString, el) => el[0]? prevString : `${prevString}${el[1]}. `, "")
    }
  }

  getExerciseCaution() {
    console.log("getExerciseCaution")
    console.log(this.state.optionPairDetails)
    let conditions = [
      [this.state.balances.tokenOption >= this.state.value * 1.0,
      `Not enough balance (${this.state.balances.tokenOption},
        need ${this.state.value})`],
      [this.state.allowances.tokenOption >= this.state.value * 1.0,
        `Not enough allowance (${this.state.allowances.tokenOption}
          , need  ${this.state.value})
          of Option tokens`],
      [this.state.allowances.basisToken >= this.state.value * this.state.optionPairDetails.strike,
        `Not enough allowance (${this.state.allowances.basisToken}
          , need  ${this.state.value * this.state.optionPairDetails.strike})
          of quotation token`],
      [this.state.balances.basisToken >= this.state.value * this.state.optionPairDetails.strike,
        `Not enough balance (${this.state.balances.basisToken}
          , need  ${this.state.value * this.state.optionPairDetails.strike})
          of quotation tokens`]
    ]
    if (conditions.every(el => el[0])) {
      return null
    }
    return {
      title: "You cannot exercise requested amount!",
      isError: true,
      body: conditions.reduce((prevString, el) => el[0]? prevString : `${prevString}${el[1]}. `, "")
    }
  }

  getWithdrawCaution() {
    let conditions = [
      [this.state.balances.tokenAntiOption >= this.state.value * 1.0,
      `Not enough balance (${this.state.balances.tokenAntiOption},
        need ${this.state.value})`],
      [this.state.allowances.tokenAntiOption >= this.state.value * 1.0,
        `Not enough allowance (${this.state.allowances.tokenAntiOption}
          , need  ${this.state.value})
          of Option tokens`]
    ]
    if (conditions.every(el => el[0])) {
      return null
    }
    return {
      title: "You cannot withdraw requested amount!",
      isError: true,
      body: conditions.reduce((prevString, el) => el[0]? prevString : `${prevString}${el[1]}. `, "")
    }
  }

  async onSelect(ek) {
    this.setState({isLoading: true})
    let fnToExec = async () => {
      let trans = await this.actions[ek].bind(this)()
      await getReceipt(trans)
      let mutatedAddresses = serieTokens.map(name => this.state.addresses[name])
      publishTokenMutation(mutatedAddresses)
      this.setState({isLoading: false, value: 0})
    }
    let makeWithCaution =  (caution) => {
      if (caution) {
        console.log("Caution is detected")
        caution.onOk = () => fnToExec()
      }
      this.setState({caution: caution})
      if (!caution) {
        fnToExec()
      }
    }
    switch (ek) {
      case WRITE:
        makeWithCaution(await this.getWriteCaution())
        break
      case ANNIHILATE:
        makeWithCaution(this.getAnnihilateCaution())
        break
      case EXERCISE:
          makeWithCaution(this.getExerciseCaution())
          break
      default: fnToExec()
    }
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
    let transObj = await getDefaultTransObj()
    return promisify(cb => optionFactory.exerciseOptions(this.props.optionPairAddress,
        DECIMAL_FACTOR.mul(this.state.value), transObj, cb))
  }

  async componentWillUnmount() {
    this.subscriber = PubSub.unsubscribe(TOPIC_AFFECTED_BALANCES)
  }

  getCaution = (props) => {
    if (!this.state.caution) {
      return null
    }
    console.log(this.state)

    console.log(this.state.caution)
    return(
      <Modal.Dialog bsStyle="danger">
        <Modal.Header>
          <Modal.Title>{this.state.caution.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{this.state.caution.body}</Modal.Body>

        <Modal.Footer>
          <Button bsStyle="success" onClick={() => {
            let fn = this.state.caution.onOk
            this.setState({caution: null})
            fn()}
          } disabled={this.state.caution.isError}>OK</Button>
          <Button  onClick={() =>   this.setState({caution: null,
            isLoading: false})}>Close</Button>
        </Modal.Footer>
      </Modal.Dialog>)

  }

  render () {
    let Caution = this.getCaution
    return (
      <div>
        <Caution/>
        <FormGroup>
         <InputGroup>
           <FormControl type="number" value={this.state.value} disabled={this.state.isLoading} onChange={(ev) => this.setState({value: ev.target.value})}/>
             <DropdownButton
               className="dropdown-action"
               componentClass={InputGroup.Button} bsStyle={this.state.isLoading ? "warning" : "success"}
               id={`dropdown_${this.props.optionPairAddress}`}
               key={`dropdown_${this.props.optionPairAddress}`}
               onSelect={(eventKey) => this.onSelect(eventKey)}
               disabled = {this.state.value === 0 ||
                 this.state.availableActions.length === 0 ||
                 this.state.isLoading}
               title={this.state.isLoading ?  "Processing" : "Action"}>
               {this.state.availableActions.map((key, i) => {
                 return <MenuItem key={"mu_" + i} eventKey={key}>{this.actionToLabel[key]}</MenuItem>
               })}
             </DropdownButton>
         </InputGroup>
        </FormGroup>
      </div>)
  }
}
