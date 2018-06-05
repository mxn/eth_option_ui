import {getWeb3}  from './Core'

import React, { Component } from 'react'

export default class TransactionStatus extends Component {
  constructor(props) {
      super(props)
      this.state = {
        transDisplayStatus: "",
        transInProgress: false
      }
      this.initTimer()
  }

  initTimer() {
    setInterval(() => {
      if (this.state.transInProgress) {
        this.setState({
          transDisplayStatus:  ".."
        })
      } else  if (this.state.transDisplayStatus !== "") {
        this.setState({
          transDisplayStatus: ""
        })
      }
    }, 1500)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.transactionHash !== prevState.transactionHash) {
      return {transactionHash: nextProps.transactionHash}
    }
    return null
  }

  componentDidMount() {
    if (this.props.transactionHash !== "") {
      this.setState({transInProgress: true,   transDisplayStatus:  ".."})
      getWeb3().eth.getTransactionReceipt(this.props.transactionHash, () => {
        this.setState({transInProgress: false})
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    /* console.log("componentDidUpdate")
    console.log(prevState)
    console.log(this.state) */
    if (this.props.transactionHash !== prevProps.transactionHash) {
      this.setState({transInProgress: true,   transDisplayStatus:  ".."})
      getWeb3().eth.getTransactionReceipt(this.props.transactionHash, () => {
        this.setState({transInProgress: false})
      })
    }
  }

  render () {
    return (
      <div>
        <span>{this.transDisplayStatus}</span>
      </div>
    )
  }
}
