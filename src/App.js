import {getWethInstance, getDaiInstance, getNetworkId, getAccount} from './components/Core.js'
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

const ExternalLink = (props) => <a href={props.href} target="_blank" rel="noreferrer noopener">{props.a}</a>

const ConceptLink = () =>
   <a href="https://mxn.github.io/eth_option/" target="_blank" rel="noreferrer noopener">concept document</a>

const Home = () => (
  <Jumbotron className="show-bg-img">
    <p>Welcome to crypto option creation site</p>
      <p>The goal of the project is a possibility to create option contracts,
      similar to stock options, for ERC20 tokens, which are themselves ERC20-tokens. The ERC20 compatibility allows the options to be easily traded on different exchanges
      </p>
      <p>The more details can be read in the <ConceptLink/>
      </p>
      <p>
      Currently, you can play the demo on Application tab. Please use <ExternalLink href="kova.ethrescan.io" a="kovan"/> network
      </p>
      <p>
      Under <strong>Help</strong> tab you can find screencasts with the examples of option operations, inclusive OTC trading
      </p>
      <p>
        To get some ETH one can use <ExternalLink href="https://github.com/kovan-testnet/faucet" a="Kovan Faucet"/>
      </p>
      <p>
        To get some DAO tokens one can
        use <ExternalLink href="https://oasis.direct/" a="Oasis Direct"/> exchange service
      </p>
      <p>
        Short roadmap
        <ul>
          <li>"democratization" of the creation of option series. Currently,
          only owners are allowed to do this. It can be seen as ERC721 based
          rights to create option series. The ERC721 tokens can get via auction.
          Incentives to create option series is collection the fees,
          which are taken by option writing</li>
          <li>Creation possibility to exercise and sell underlying via exchange
          in one transaction. It allows for option owner to perform
          the operation without full coverage of the exercised amount</li>
          <li>Make the option tokens as ERC821 compatible to simplify option
          operations which are currently required first to approve option and
          anti-option tokens</li>
          <li>Optimization of option series creation in the sense of
          the gas costs</li>
          <li>Simplification of options trading. Normally the token exchanges require registration for every token and this process does not suite well for option and anti-option tokens</li>
        </ul>
      </p>
    </Jumbotron>
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
