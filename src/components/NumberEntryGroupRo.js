import {isTransEnabled} from './Core'
import ProcessingButton from './ProcessingButton'

import React, {Component} from 'react'
import {FormGroup, FormControl, InputGroup} from 'react-bootstrap'


export class NumberEntryGroupExt extends Component {
  state = {isProcessing: false}
  render() {
    return <NumberEntryGroupRo {...this.props} onButtonClick={async () => {
      this.setState({isProcessing: true})
      await this.props.onClick()
      this.setState({isProcessing: false})
    }} isProcessing={this.state.isProcessing}/>
  }
}

export  default class NumberEntryGroup extends Component {
  state = {isProcessing: false, value: 0}
  render() {
    return <NumberEntryGroupRo {...this.props} onButtonClick={async () => { 
      this.setState({isProcessing: true})
      try {
        await this.props.onClick(this.state.value)
      } finally {
        this.setState({isProcessing: false})
      }
     }} onChange={v => this.setState({value: v})} value={this.state.value} 
    isProcessing={this.state.isProcessing}/>
  }
}

const NumberEntryGroupRo = ({label, onButtonClick, onChange, value, isProcessing, minValue, maxValue, button}) => {
    return (
      <FormGroup>
        <InputGroup>
          <InputGroup.Addon>{label}</InputGroup.Addon>
          <FormControl type="number" value={value}
            disabled={isProcessing || !isTransEnabled()}
            min={minValue || 0}
            max={maxValue || Number.MAX_SAFE_INTEGER}
            onChange={ev => onChange(ev.target.value)}
            onFocus={(ev) => ev.target.select()}
            />
          <InputGroup.Button>
            <ProcessingButton onClick={onButtonClick} button={button}/>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    )
}

