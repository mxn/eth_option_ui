import {getBalance, getOptionFactoryInstance} from './Core.js'
import {getOptionTable} from './ModelView'
import OptionTableEntry from './OptionTableEntry'
import TokenDetail from './TokenDetail'

import {groupBy, sortBy} from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import {Grid, Row, Col, Panel} from 'react-bootstrap'

class OptionDateEntry extends Component {
  render () {
    return (
    <Panel bsStyle="primary">
    <Panel.Heading>
      <Row>
        <Col sm={2}>{moment(this.props.date * 1000).format("YYYY-MM-DD HH:mm:ss")}</Col>
        <Col sm={5}>Strike</Col>
        <Col sm={5}>Underlying Qty</Col>
      </Row>
    </Panel.Heading>
    <Panel.Body>
    {this.props.logEntries.map(o => {
      return (
      <Row key={o.transactionHash}>
        <OptionTableEntry logEntry={o}/>
      </Row>)
    })}
    </Panel.Body>
    </Panel>)
  }
}

export default class OptionTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: []
    }
  }

  async componentDidMount() {
    const optionFactoryInstance = await getOptionFactoryInstance()
    this.setState({optionFactory: optionFactoryInstance.address})
    //let tbl = await getOptionTable()
    var basisBalance, underlyingBalance, optionTable
    [basisBalance, underlyingBalance, optionTable] = await 
      Promise.all([getBalance(this.props.underlying),  getBalance(this.props.basisToken),  getOptionTable()])
    this.setState({
        data: optionTable,
        underlyingBalance: underlyingBalance,
        basisBalance: basisBalance
    })
  }

  render() {
    console.log("optionTable in render",this.state.data)
    const groupedData = groupBy(this.state.data,
      o => o.expireTime.toFixed())
    if (!this.state.optionFactory) {
      return <div>Loading...</div>
    }
    return (<Grid className="show-grid">
      <Row>
        <h4>Option Table</h4>
      </Row>
      <Row>
          <TokenDetail key="tokenBasis" label="Basis" token={this.props.basisToken} targetApproval={this.state.optionFactory}/>
      </Row>
      <Row>
          <TokenDetail key="tokenUnderlying" label="Underlying" token={this.props.underlying} targetApproval={this.state.optionFactory}/>
      </Row>
      {Object.keys(groupedData).map(dt =>
          <OptionDateEntry key={"groupDate_" + dt} date={dt}
            logEntries={sortBy(groupedData[dt], o => o.strike /
              o.underlyingQty)}/>)}
      </Grid>
    )
  }
  }
