import React, {Component} from 'react'
import {Button} from 'react-bootstrap'

export default class ProcessingButton extends Component {
  constructor(props) {
    super(props)
    this.state = {isProcessing: false}
  }

  async onClick() {
    this.setState({isProcessing: true})
    await this.props.onClick()
    this.setState({isProcessing: false})
  }

  render() {
    return (<Button className="Button-action"
    bsStyle={this.state.isProcessing ? "warning" : "primary"}
    disabled={this.state.isProcessing || this.props.disabled}
    onClick={() => this.onClick()}> {this.state.isProcessing ? "Processing":
    this.props.button } </Button>)
  }
}