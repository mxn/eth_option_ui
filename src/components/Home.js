import {ExternalLink, ConceptLink} from './Commons.js'

import React, { Component } from 'react'
import {Jumbotron} from 'react-bootstrap'


export default class Home extends Component {
  render () {
    return (
        <Jumbotron className="show-bg-img">
          <p>Welcome to crypto option creation site!</p>
            <p>The goal of the project is a possibility to create option contracts,
            similar to stock options, for ERC20 tokens, which are themselves ERC20-tokens. The ERC20 compatibility allows the options to be easily traded on different exchanges
            </p>
            <p>The more details can be read in the <ConceptLink/>
            </p>
            <p>
            Currently, you can play the demo on <strong>Try It!</strong> tab. You need a web3-enabled browser (e.g. with installed <ExternalLink href="https://metamask.io/" a="Metamask extension"/>). Please use <ExternalLink href="kova.ethrescan.io" a="kovan"/> network
            </p>
            <p>
            Under <strong>Help</strong> tab you can find the screencasts with the examples of option operations, inclusive OTC trading. For OTC trading one can use <ExternalLink href="https://0xproject.com/portal/generate" a="this 0x portal link"/>
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
            </p>
              <ul>
                <li>"Democratization" of the creation of option series. Currently,
                only hte owner is allowed to do this. It could be implememted as ERC721 based
                rights to create option series. The ERC721 tokens can be purchased via auction.
                Incentives to create option series is collection the fees,
                which are taken by option writing</li>
                <li>Creation possibility to exercise and sell underlying via exchange
                in one transaction. It will allow the options owner to perform
                the operation without full coverage of the exercised amount</li>
                <li>Make the option tokens ERC821 compatible to simplify option
                operations which are currently required to execute separate approve
                tarnsactions for option and
                anti-option tokens</li>
                <li>Optimization of option series creation in the sense of
                the gas costs</li>
                <li>Simplification of options trading. Normally the
                token exchanges require registration for every token and
                this process does not suite well for option and anti-option
                tokens</li>
              </ul>
          </Jumbotron>
    )
  }
}
