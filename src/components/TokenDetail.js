import Approval from './Approval'
import { getBalance, getDisplayTokenName, TOPIC_AFFECTED_BALANCES} from './Core'

import PubSub from 'pubsub-js'
import React from 'react'
import {Grid, Row, Col, ControlLabel} from 'react-bootstrap'

export default class TokenDetail extends React.Component {


  constructor(props) {
    super(props)
    this.state = {
      balance: null,
      tokenName: null
    }
    this.balanceSubscriber =  PubSub.subscribe(TOPIC_AFFECTED_BALANCES,
      (msg, data) => {
        if (data[this.props.token]) {
          this.updateBalance()
        }
      })
  }

  async updateBalance() {
    if (this.props.token !== null) {
      this.setState ({
        balance: await getBalance(this.props.token),
      })
    }
  }

  async componentDidMount() {
    this.updateBalance()
  }

  async componentWillUnmount() {
    PubSub.unsubscribe(this.balanceSubscriber);
  }

  render() {
    if (this.props.token === null || this.state.balance === null || this.props.targetApproval === null ) {
      return <div>Loading...</div>
    }
    return (
      <Grid>
        <Row>
          <Col sm={2}  componentClass={ControlLabel}>{this.props.label}</Col>
          <Col sm={8}> {getDisplayTokenName(this.props.token)}</Col>
          <Col sm={2}> {Number(this.state.balance).toFixed(5)}</Col>
        </Row>
        <Row>
          <Col sm={10}>
            <Approval token={this.props.token} targetContract={this.props.targetApproval}/>
          </Col>
        </Row>
      </Grid>
    )
  }
}
