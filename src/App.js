import {Contact} from './components/Contact.js'
import Home from './components/Home.js'
import OptionApp from './components/OptionApp'
import {ConceptLink} from './components/Commons.js'
import React, { Component } from 'react'
import './App.css'

import {Row,  Navbar, Nav, NavItem,
  Jumbotron, Col} from 'react-bootstrap'
import {HashRouter, Route} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'

const MainMenu = () => (
  <Navbar>
    <Nav>
    <LinkContainer to="/home">
      <NavItem eventKey={1}><strong>Home</strong></NavItem>
    </LinkContainer>
    <LinkContainer to="/app/option-table">
      <NavItem eventKey={2}>Try It!</NavItem>
    </LinkContainer>
    <LinkContainer to="/help">
      <NavItem eventKey={3}>Help</NavItem>
    </LinkContainer>
    <LinkContainer to="/contact">
      <NavItem eventKey={4}>Contact</NavItem>
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
          <iframe title={props.name} className="embed-responsive-item" src={props.src} frameBorder="0"
            allow="autoplay; encrypted-media" allowFullScreen></iframe>
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
      <ScreenCastRow name="Exercise options with exchange" src="https://www.youtube.com/embed/fM1Tlisu6h4"/>
      <ScreenCastRow name="Withdraw via anti-options options" src="https://www.youtube.com/embed/qBhJnKGoKt0"/>
    </Jumbotron>

)

const MainRoutes = () => (
    <div>
      <Route exact path='/' component={Home}/>
      <Route exact path='/home' component={Home}/>
      <Route path='/app' component={OptionApp}/>
      <Route exact path='/help' component={Help}/>
      <Route exact path='/contact' component={Contact}/>
    </div>
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
