import {setStatePropFromEvent, isTransEnabled,
  getDisplayTokenName}  from './Core'
import ProcessingButton from './ProcessingButton'
import {createOptionLine} from './Actions'

import React, { Component } from 'react'
import {Row, Col, FormGroup,  FormControl,
  ControlLabel, Form, Grid} from 'react-bootstrap'
import DayPickerInput from 'react-day-picker/DayPickerInput';

import 'react-day-picker/lib/style.css';

export default class OptionLineCreator extends Component {
  constructor (props) {
    super(props)
    this.state = {
      strike: 0,
      underQty: 0,
      expireDate: "",
    }
  }

  async componentWillMount() {
    this.handleEvents = this.handleEvents.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
  }


   handleDateChange(day) {
    console.log(day)
    this.setState({expireDate: day})
  }

  async generateOptionLine() {
    const underlying = this.props.underlying
    const basis = this.props.basisToken
    if ((underlying !== undefined) && (basis !== undefined) && (this.state.expireDate !== undefined)) {
      let expireDateLocal = new Date(this.state.expireDate)
      let expireDateUtc = Date.UTC(expireDateLocal.getFullYear(),
      expireDateLocal.getMonth(), expireDateLocal.getDate())
      let expireDate = new Date(expireDateUtc + 12 * 60 * 60 * 1000 - 1000)
      await createOptionLine(underlying, basis,
        this.state.strike, this.state.underQty,
       expireDate)
    }
  }

  async handleEvents(ev) {
    setStatePropFromEvent(ev, this)
  }

  render() {
    var AlertNonOwner = () => null
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
                disabled={!isTransEnabled()}
                onChange={this.handleEvents}/>
            </Col>
        </FormGroup>
        <FormGroup controlId="underQty">
            <Col sm={4} componentClass={ControlLabel}>
              Underlying Quantity:
            </Col>
            <Col sm={8}>
              <FormControl type="number" value={this.state.underQty}
                disabled={!isTransEnabled()}
                onChange={this.handleEvents}/>
            </Col>
        </FormGroup>
        <FormGroup>
        <Col sm={4} componentClass={ControlLabel}>
          Expire Date:
        </Col>
        <Col sm={8}>
          <DayPickerInput id="expireDate"
            disabled={!isTransEnabled()}
            onDayChange={this.handleDateChange} />
        </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <ProcessingButton type="button"
              disabled={this.state.strike === 0 ||
                this.state.underQty === 0 ||
                this.state.expireDate === ""}
              onClick={() => this.generateOptionLine()} button="Create"/>
          </Col>
        </FormGroup>
      </Form>
    </Grid>)
  }
}
