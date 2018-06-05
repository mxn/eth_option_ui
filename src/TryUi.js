import React, { Component } from 'react';
import './App.css';
import EventManager from 'js-simple-events'



const eventManager = new EventManager()

class OptionSet extends Component {
  constructor (props) {
    super(props)
    this.state = {
      optionBalance: 0,
      antiOptionBalance: 0,
      noOptionsToWrite: 0
    }
    this.handleEvents = this.handleEvents.bind(this)
  }

  handleEvents(ev) {
    switch (ev.target.id) {
      case "noOptionsToWrite": {
        this.setState({noOptionsToWrite: ev.target.value})
        break
      }
      case "btnWrite": {
        //this.setState({noOptionsToWrite: ev.target.value})

        eventManager.emit("write", JSON.stringify({noOptionsToWrite: this.state.noOptionsToWrite}))
        break
      }

      default: {
        console.log("default event handler")
        console.log(ev.target)
      }
    }
  }

  componentDidMount() {
    this.setState(
      {
        optionBalance: Math.floor(Math.random() * 100),
        antiOptionBalance: Math.floor(Math.random() * 100),
      }
    )
  }

  getCollapseId() {

    //return `collapseId_${this.props.strike}_${this.props.underlyingQty}`
    return `collapseId_${this.props.keyId}`
  }

  render () {
    return  (
      <div>
        <div className="row">
          <div className="col-sm-2 border"><button className="btn btn-secondary" data-toggle="collapse" data-target={"#" + this.getCollapseId()}>...</button></div>
          <div className="col-sm-5 border">{this.props.strike}</div>
          <div className="col-sm-5 border">{this.props.underlyingQty}</div>
        </div>
        <div id={this.getCollapseId()} className="collapse">
          <div className="row">
            <div className="col-sm-2 border">Option</div>
            <div className="col-sm-8 border">{this.props.optionAddress}</div>
            <div className="col-sm-2 border">{this.state.optionBalance}</div>
          </div>
          <div className="row">
            <div className="col-sm-2 border">Anti-Option</div>
            <div className="col-sm-8 border">{this.props.antiOptionAddress}</div>
            <div className="col-sm-2 border">{this.state.antiOptionBalance}</div>
          </div>

          <div className="row">
              <div className="col-sm-12 border">
                <div className="input-group">
                  <div className="input-group">
                    <span className="input-group-addon">Underlying,  Approved: {this.state.noOptionsToWrite}</span>

                  <input id="noOptionsToWrite" type="number" className="form-control" value={this.state.noOptionsToWrite} onChange={this.handleEvents}/>
                  <span className="input-group-btn">
                    <button id="btnWrite" className="btn btn-primary" onClick={this.handleEvents}>Write</button>
                  </span>
                  </div>
                </div>
              </div>
        </div>
      </div>
    </div>
    )
  }
}

class OptionTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      date: new Date(2019,1,1,12,59,59),
      optionEntries: []
    }
    console.log("OptionTable")
    console.log(this.state.optionEntries)
  }

  componentUnmoun() {

  }


  componentDidMount() {
    let lst = []
    lst.push ({optionAddress: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
      antiOptionAddress:"0xF5fdf4076b8F3A5357c5E395ab970B5B54098Fec",
      strike: 150,
      underlyingQty: 100
    })
    lst.push ({optionAddress: "0xB5fdf4076b8F3A5357c5E395ab970B5B54098Fee",
      antiOptionAddress:"0xE5fdf4076b8F3A5357c5E395ab970B5B54098Feb",
      strike: 250,
      underlyingQty: 100
    })
    this.setState({optionEntries: lst})
    eventManager.on("write", payload => console.log(`Payload: ${payload}`))
  }

  render () {
    let optionSetList = this.state.optionEntries.map( (o,i) =>
     <OptionSet key={"option_" + i} keyId={"option_" + i} strike={o.strike} underlyingQty={o.underlyingQty} optionAddress={o.optionAddress} antiOptionAddress={o.antiOptionAddress}/>
    )
    return (
      <div className="container">
        <div className="row">
          <div className="col">{this.state.date.toString()}</div>
        </div>
        <div className="row">
          <div className="col-sm-2 border">&nbsp;</div>
          <div className="col-sm-5 border"><h5>Strike</h5></div>
          <div className="col-sm-5 border"><h5>Per</h5></div>
        </div>
        {optionSetList}

      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="container bg-light">
        <div className="row">
          <p className="lead">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
        </div>
        <OptionTable/>
      </div>

    );
  }
}


export default App;
