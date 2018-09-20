import WethConvertor from './WethConvertor.js'
import OptionLineCreator from './OptionLineCreator.js'
import OptionTable from './OptionTable.js'
import {getWethInstance, getDaiInstance, getNetworkId, getNetworkName,
  getAccount, isTransEnabled} from './Core.js'
import {ExternalLink} from './Commons.js'

import React, { Component } from 'react'
import {Grid, Row, Alert, Nav, NavItem} from 'react-bootstrap'
import {Route} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'

class Content extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    this.setState({account: await getAccount(),
      networkName: await getNetworkName()})
  }

  static getDerivedStateFromProps(prev, nextProps) {
    return nextProps
  }

  render () {
    if (this.props.notValidNetwork)  {
      return <Alert>Checking network: currently only <strong>kovan</strong> network is supported. 
      It is recommended to use Chrome browser with <ExternalLink href="https://metamask.io/" a="Metamask"/> extension and an unlocked account</Alert>
    } else if (this.props.isLoading) {
      return <Row><span>Loading...</span></Row>
    } else  {
      let FirstRow = () => isTransEnabled() ?
        (<span>Account: {this.state.account}
          {this.state.networkName === 'main' ? '' :
          ` (network: ${this.state.networkName})` }</span>) :
        (<Alert bsStyle="warning">Currently you run the application in
          read-only mode on <strong>{this.state.networkName}</strong> network
          with
          limited and unstable functionality. For transaction processing
          you need to have web3 extensions, e.g.
        <ExternalLink href="https://metamask.io/" a="Metamask"/>,
        and unlocked account</Alert>)
        let OptionTableRouted = () => (<OptionTable underlying={this.props.underlying}
          basisToken={this.props.basisToken}/>)
        let OptionLineCreatorRouted =  () => (<OptionLineCreator underlying={this.props.underlying}
        basisToken={this.props.basisToken}/>)
      return (
        <div>
          <FirstRow/>
          <Nav bsStyle="tabs" activeKey="1">
            <LinkContainer to="/app/option-table">
              <NavItem eventKey="1">Option Table</NavItem>
            </LinkContainer>
            <LinkContainer to="/app/weth-convertor">
              <NavItem eventKey="2">Weth Convertor</NavItem>
            </LinkContainer>
            <LinkContainer to="/app/option-line-creation">
              <NavItem eventKey="3">Option Line Creation</NavItem>
            </LinkContainer>
          </Nav>
          <div>
            <Route exact path="/app/option-table" component={OptionTableRouted}/>
            <Route exact path="/app/option-line-creation" component={OptionLineCreatorRouted}/>
            <Route exact path="/app/weth-convertor" component={WethConvertor}/>
          </div>
        </div>
      )
    }
  }
}

export default class OptionApp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      underlying: null,
      basisToken: null,
      isNotValidNetwork: true
    }
  }

  async isValidNetwork () {
    let netId = await getNetworkId()
    console.log("netId: " + netId)
    return ([3, 42, 5777].indexOf(Number(netId)) >= 0)
  }

  async componentWillMount() {
    this.setState({underlying: (await getWethInstance()).address,
        basisToken: (await getDaiInstance()).address,
        isNotValidNetwork: !(await this.isValidNetwork())})

  }

  async onChangeAccount() {
    await this.setState({isNotValidNetwork: !(await this.isValidNetwork())})
    this.forceUpdate()
  }

  render() {
    return (
      <Grid>
        <Row><h1 className="App-title">Crypto Token Options</h1></Row>
              <Content notValidNetwork={this.state.isNotValidNetwork}
                  isLoading={this.state.basisToken == null || this.state.underlying == null}
                  underlying={this.state.underlying}
                  basisToken={this.state.basisToken}
                  />
        </Grid>
    )

  }
}