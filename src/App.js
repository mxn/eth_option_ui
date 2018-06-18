import {getWethInstance, getDaiInstance, getNetworkId,
  getAccount} from './components/Core.js'
import Home from './components/Home.js'
import {ConceptLink} from './components/Commons.js'
import WethConvertor from './components/WethConvertor.js'
import OptionLineCreator from './components/OptionLineCreator.js'
import OptionTable from './components/OptionTable.js'

import React, { Component } from 'react'
import './App.css'
import {Web3Provider } from 'react-web3';
import {Grid, Row, Tabs, Tab, Alert, Navbar, Nav, NavItem,
  Jumbotron, Col} from 'react-bootstrap'
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

const ScreenCastRow = (props) => (
  <Row>
    <Col sm={1}>&nbsp;</Col>
    <Col md={3}><p>{props.name}</p></Col>
    <Col md={8}>
      <div style={{ width: 640, height: 'auto' }}>
        <div className="embed-responsive embed-responsive-16by9">
          <iframe title={props.name} className="embed-responsive-item" src={props.src} frameborder="0"
            allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>
    </Col>
  </Row>
)

const Help = () => (
    <Jumbotron>
      <p>For the operations see the screencasts below. See also the <ConceptLink/></p>
      <ScreenCastRow name="Create Option Serie and Writing Options" src="https://www.youtube.com/embed/z-HqmaYFpGE"/>
      <ScreenCastRow name="OTC Trading Options" src="https://www.youtube.com/embed/Ed7_bkUnPzM"/>
      <ScreenCastRow name="Exercise options" src="https://www.youtube.com/embed/qJY2KpnrClw"/>
      <ScreenCastRow name="Withdraw via anti-options options" src="https://www.youtube.com/embed/qBhJnKGoKt0"/>
    </Jumbotron>

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
