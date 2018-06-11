import React, {Component} from 'react'
import {Button, Modal} from 'react-bootstrap'


export default class Caution extends Component {
  constructor(props) {
    super(props)
    this.state = {show: false,
      title: this.props.title,
      body: this.props.body
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return nextProps
  }

  render() {
    if (!this.state.show) {
      return null
    }
    return (<div className="static-modal">
        <Modal.Dialog bsStyle="danger">
          <Modal.Header>
            <Modal.Title>{this.state.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.state.body}</Modal.Body>

          <Modal.Footer>
            <Button bsStyle="success" onClick={() => this.props.onOk()}>OK</Button>
            <Button onClick={()=>this.props.onClose()}>Close</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>)
  }
}
