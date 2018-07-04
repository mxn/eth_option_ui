import {isTransEnabled} from './Core'
import ProcessingButton from './ProcessingButton'

import React, { Component } from 'react'
import {FormGroup, FormControl, InputGroup} from 'react-bootstrap'

export default class NumberEntryGroup extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: this.props.value || 0,
      label: this.props.label,
      isProcessing: false
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return nextProps
  }

  async onClick() {
    this.setState({isProcessing: true})
    await this.props.onClick.call(null,this.state.value)
    this.setState({value: this.props.value || 0, isProcessing: false})
  }

  render() {
    return (
      <FormGroup>
        <InputGroup>
          <InputGroup.Addon>{this.state.label}</InputGroup.Addon>
          <FormControl type="number" value={this.state.value}
            disabled={this.state.isProcessing || !isTransEnabled()}
            min={this.props.min || 0}
            max={this.props.max || Number.MAX_SAFE_INTEGER}
            onChange={(v) => this.setState({value: v.target.value})}/>
          <InputGroup.Button>
            <ProcessingButton onClick={() => this.onClick()} button={this.props.button}/>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    )
  }
}
