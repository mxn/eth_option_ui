import {getWeb3, getBalance, getOptionPairInstance, promisify}  from './Core'
import OptionActions from './OptionActions'
import TokenDetail from './TokenDetail'

import React, { Component } from 'react'
import {Row, Col, ControlLabel, Button, Panel, PanelGroup} from 'react-bootstrap'

const web3 = getWeb3()
const web3utils = web3._extend.utils

export default class OptionTableEntry extends Component {
  constructor(props) {
    super(props)
    this.state = {
      optionPairAddress: null,
      optionAddress: null,
      antiOptionAddress: null,
      optionsToWrite: 0,
      detailExpanded: false
    }
  }

  async componentWillMount() {
    let o = this.props.logEntry
    this.setState({balanceUnderlying: await getBalance(o.underlying),
      balanceBasis:  await getBalance(o.basisToken)
    })
    let optionPairContract = await getOptionPairInstance(o.optionPair)
    this.setState({optionPairAddress: o.optionPair,
      optionAddress: await promisify(cb => optionPairContract.tokenOption(cb)),
      antiOptionAddress: await promisify(cb => optionPairContract.tokenAntiOption(cb))})
  }



  render() {
    let o = this.props.logEntry
    if (this.state.optionAddress === null|| this.state.antiOptionAddress === null) {
      return <div>Loading...</div>
    }
    return (<PanelGroup id={`PanelGroup_${o.optionPair}`}>
      <Panel  expanded={this.state.detailExpanded} onToggle={() => null}>
        <Panel.Heading>
          <Row>
            <Col sm={2}><Button type="button"
              onClick={() => this.setState({
                detailExpanded: !this.state.detailExpanded })}>{this.state.detailExpanded ? "-" : "+"}</Button>
            </Col>
            <Col sm={5} componentClass={ControlLabel}>{web3utils.toDecimal(o.strike)}</Col>
            <Col sm={5} componentClass={ControlLabel}>{web3utils.toDecimal(o.underlyingQty)}</Col>
          </Row>
        </Panel.Heading>
        <Panel.Collapse>
          <TokenDetail label="Option" token={this.state.optionAddress} targetApproval={this.state.optionPairAddress}/>
          <TokenDetail label="Anti-Option" token={this.state.antiOptionAddress} targetApproval={this.state.optionPairAddress}/>
          <Col sm={7}>
            <OptionActions optionPairAddress={this.state.optionPairAddress}/>
          </Col>
        </Panel.Collapse>
      </Panel>
    </PanelGroup>)
  }
}
