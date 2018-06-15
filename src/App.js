import {getWethInstance, getDaiInstance, getNetworkId, getAccount} from './components/Core.js'
import WethConvertor from './components/WethConvertor.js'
import OptionLineCreator from './components/OptionLineCreator.js'
import OptionTable from './components/OptionTable.js'

import React, { Component } from 'react'
import './App.css'
import {Web3Provider } from 'react-web3';
import {Grid, Row, Tabs, Tab, Alert, Navbar, Nav, NavItem} from 'react-bootstrap'
import {HashRouter, Switch, Route} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'

const MainMenu = () => (
  <Navbar>
    <Nav>
    <LinkContainer to="/home">
      <NavItem eventKey={1}><strong>Home</strong></NavItem>
    </LinkContainer>
    <LinkContainer to="/app">
      <NavItem eventKey={2}>Application</NavItem>
    </LinkContainer>
    <LinkContainer to="/help">
      <NavItem eventKey={3}>Help</NavItem>
    </LinkContainer>
    </Nav>
  </Navbar>
)

const Home = () => (
  <div>
    <div>Welcome to crypto option creation</div>
    <div>The goal of the project is possibility to create options, which
    are ERC20 tokens based, and themselves are ERC20-tokens.
    The ERC20 compatibility allows for the options to be easily traded on
    the exchanges
    </div>

  </div>
)

const Help = () => (
  <div>
    See Demo on Youtube
  </div>
)


class Content extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    this.setState({account: await getAccount()})
  }

  static getDerivedStateFromProps(prev, nextProps) {
    return nextProps
  }

  render () {
    if (this.props.notValidNetwork)  {
      return <Alert>Checking network: currently only <strong>kovan</strong> and &nbsp;
      <strong>ropsten</strong> networks are supported</Alert>
    } else if (this.props.isLoading) {
      return <Row><span>Loading...</span></Row>
    } else  {
      return (
        <Grid>
          <Row>Account: {this.state.account} </Row>
          <Tabs id="main_tabs">
            <Tab eventKey="1" title="Options' Operations">
              <OptionTable underlying={this.props.underlying}
                  basisToken={this.props.basisToken}/>
            </Tab>
            <Tab eventKey="2" title="ETH Warpper">
              <WethConvertor/>
            </Tab>
            <Tab eventKey="3" title="Options' Admin">
              <OptionLineCreator
                underlying={this.props.underlying}
                basisToken={this.props.basisToken}/>
            </Tab>
          </Tabs>
        </Grid>
      )
    }
  }
}

export class OptionApp extends Component {
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
    console.log("render OptionApp")

    return (
      <Grid>
        <Row><h1 className="App-title">Crypto Token Options</h1></Row>
          <Web3Provider onChangeAccount={acc => this.onChangeAccount()}>
              <Content notValidNetwork={this.state.isNotValidNetwork}
                  isLoading={this.state.basisToken == null || this.state.underlying == null}
                  underlying={this.state.underlying}
                  basisToken={this.state.basisToken}
                  />
          </Web3Provider>
        </Grid>
    )

  }
}

const MainRoutes = () => (
  <Switch>
    <Route exact path='/' component={Home}/>
    <Route exact path='/home' component={Home}/>
    <Route exact path='/app' component={OptionApp}/>
    <Route exact path='/help' component={Help}/>
  </Switch>
)

export default class App extends Component {
  render () {
      return (
            <HashRouter>
              <div>
                <MainMenu/>
                <MainRoutes/>
              </div>
            </HashRouter>
      )
    }
}
