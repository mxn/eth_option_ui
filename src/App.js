import {getWethInstance, getDaiInstance} from './components/Core.js'
import WethConvertor from './components/WethConvertor.js'
import OptionLineCreator from './components/OptionLineCreator.js'
import OptionTable from './components/OptionTable.js'

import React, { Component } from 'react'
import './App.css'
import {Web3Provider } from 'react-web3';
import {Grid, Row, Tabs, Tab} from 'react-bootstrap'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      underlying: null,
      basisToken: null
    }
  }

  async componentWillMount() {
    this.setState({underlying: (await getWethInstance()).address,
        basisToken: (await getDaiInstance()).address})
  }

  render() {
    if (this.state.basisToken == null || this.state.underlying == null) {
      return (
        <Grid>
          <Row><h1 className="App-title">Crypto Token Options</h1></Row>
          <Row><span>  Loading...</span></Row>
        </Grid>
      )
    }
    return (
      <Web3Provider>
      <Grid>

        <Row><h1 className="App-title">Crypto Token Options</h1></Row>
        <Row>
          <Tabs id="main_tabs">
            <Tab eventKey="1" title="Options' Operations">
              <OptionTable underlying={this.state.underlying}
                  basisToken={this.state.basisToken}/>
            </Tab>
            <Tab eventKey="2" title="ETH Warpper">
              <WethConvertor/>
            </Tab>
            <Tab eventKey="3" title="Options' Admin">
              <OptionLineCreator
                underlying={this.state.underlying}
                basisToken={this.state.basisToken}/>
            </Tab>
          </Tabs>
        </Row>
        </Grid>
      </Web3Provider>
    )
  }
}
