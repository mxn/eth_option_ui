import {setStatePropFromEvent, promisify,
  getOptionFactoryInstance, getWeb3, getReceipt,
  getDisplayTokenName, getDefaultTransObj}  from './Core'
import ProcessingButton from './ProcessingButton'

import React, { Component } from 'react'
import {Row, Col, FormGroup,  FormControl,
  ControlLabel, Form, Grid, Alert} from 'react-bootstrap'
import DayPickerInput from 'react-day-picker/DayPickerInput';

import 'react-day-picker/lib/style.css';

//const GAS_LIMIT_OPTION_LINE = 6200000

var web3 = getWeb3()

export default class OptionLineCreator extends Component {
  constructor (props) {
    super(props)
    this.state = {
      strike: 0,
      underQty: 0,
      expireDate: "",
      isOwner: false
    }
  }

  async componentWillMount() {
    this.handleEvents = this.handleEvents.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    const optionFactoryInstance = await getOptionFactoryInstance()
    let owner = await promisify(cb => optionFactoryInstance.owner(cb))
    this.setState({isOwner: owner === web3.eth.accounts[0]})
  }

   handleDateChange(day) {
    console.log(day)
    this.setState({expireDate: day})
  }

  async generateOptionLine() {
    const underlying = this.props.underlying
    const basis = this.props.basisToken
    if ((underlying !== undefined) && (basis !== undefined) && (this.state.expireDate !== undefined)) {
      const optionFactoryInstance = await getOptionFactoryInstance()
      let expireDateLocal = new Date(this.state.expireDate)
      let expireDateUtc = Date.UTC(expireDateLocal.getFullYear(),
      expireDateLocal.getMonth(), expireDateLocal.getDate())
      let expireDate = new Date(expireDateUtc + 12 * 60 * 60 * 1000 - 1000)
      let transObj = await getDefaultTransObj()
      let trans = await promisify(cb => optionFactoryInstance.createOptionPairContract(underlying, basis,
           this.state.strike, this.state.underQty,
          expireDate / 1000,
          transObj, cb))
      await getReceipt(trans)
    }
  }

  async handleEvents(ev) {
    setStatePropFromEvent(ev, this)
  }

  render() {
    var AlertNonOwner = () => null

    if (!this.state.isOwner) {
      AlertNonOwner = () => (<Alert bsStyle="warning">
      You are not allowed to create options lines
      </Alert>)
    }
    return (
      <Grid className="show-grid">
        <AlertNonOwner/>
        <Form horisontal="true">
        <Row><h4>Option Line Creator</h4></Row>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>Basis:</Col>
          <Col sm={8} componentClass={FormControl.Static}>
            {getDisplayTokenName(this.props.basisToken)}</Col>
        </FormGroup>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>Underlying:</Col>
          <Col sm={8} componentClass={FormControl.Static}>
            {getDisplayTokenName(this.props.underlying)}</Col>
        </FormGroup>
        <FormGroup controlId="strike">
            <Col sm={4} componentClass={ControlLabel}>
              Strike:
            </Col>
            <Col sm={8}>
              <FormControl type="number" value={this.state.strike}
                onChange={this.handleEvents}/>
            </Col>
        </FormGroup>
        <FormGroup controlId="underQty">
            <Col sm={4} componentClass={ControlLabel}>
              Underlying Quantity:
            </Col>
            <Col sm={8}>
              <FormControl type="number" value={this.state.underQty}
                onChange={this.handleEvents}/>
            </Col>
        </FormGroup>
        <FormGroup>
        <Col sm={4} componentClass={ControlLabel}>
          Expire Date:
        </Col>
        <Col sm={8}>
          <DayPickerInput id="expireDate"
            onDayChange={this.handleDateChange} />
        </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <ProcessingButton type="button"
              disabled={this.state.strike === 0 ||
                this.state.underQty === 0 ||
                this.state.expireDate === "" ||
                !this.state.isOwner}
              onClick={() => this.generateOptionLine()} button="Create"/>
          </Col>
        </FormGroup>
      </Form>
    </Grid>)
  }
}
