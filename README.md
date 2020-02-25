# ethfundraiser

_An Ethereum dApp that can be used to raise funds, with payments then released based on contributors voting for each spending request._

> Created by Malarena SA - www.malarena.com

## Basic dApp functionality
The dApp has the following pages:
- Home - Provides an overview of the application and how the process works for Fund Raisers and Contributors
- New Contract - Provides the ability to deploy a new FundRaiser Smart Contract onto the Ethereum Blockchain by supplying the contract duration, initial payment duration, goal and minimum contribution level for the fundraising campaign
- Existing Contract - Provides the ability to view the current status and interact with an existing contract already deployed, including making contributions, getting a refund (if allowed) and changing the contract owner
- Spending Requests - Provides the ability for the contract owner to raise spending requests, for contributors to vote on them, and once approved for the funds to be released

In addition there are two pop-up tools:
- Block Converter - This provides a conversion between number of blocks and duration (in Days/Hours/Minutes) based on the current network block time, which can be set manually or uses the current Network Average Block Time from Etherscan
- Wei Converter - A simple converter between Wei, Ether and USD based on the current rates published in Etherscan

## FundRaiser Smart Contract functionality
For a complete overview of the FundRaiser Smart Contract functionality please see the FundRaiser [README.md](contracts/README.md) file.

The Smart Contract is deployed using the "New Contract" option in the dApp. However, it can also be compiled and deployed stand-alone using [Remix](https://remix.ethereum.org/) or  [Truffle](https://www.trufflesuite.com/truffle).

## Tooling Overview
This dApp has an HTML front-end built using the [Bootstrap](https://getbootstrap.com/) toolkit, and uses JavaScript and the [web3.js](https://github.com/ethereum/web3.js) API to process transactions via an Ethererum Wallet (such as [MetaMask](https://metamask.io/)) onto the Ethereum Blockchain using the "FundRaiser" smart contract, all of which is supported using data from [Etherscan](https://etherscan.io/).

The web server is hosted using the [express](https://www.npmjs.com/package/express) Node.js module.


## Installation and set-up
To install a stand-alone version of the dApp and Smart Contract you will need to have [npm](https://www.npmjs.com/) and [Node.js](https://nodejs.org/en/) installed, and then:
1) Open a terminal windows/command prompt, navigate to the directory required and then `git clone` the ethfundraiser project
2) Change to the newly created directory and run `npm install` to load the required npm modules
3) Edit the `./frontend/js/ethfundraiser_defaults_ToDo.js` file and update the dApp default values, such as your donation address, Etherscan API Key and WebHosting URL. Save this file in the same directory as `ethfundraiser_defaults.js`
4) To start-up the webserver run `npm run server`. The webserver should then be running on http://localhost:3000/. Adjust the port settings in `server.js` as required

## FundRaiser Smart Contract Tests, Coverage and MythX Reports
A full suite of Truffle tests have been developed for the FundRaiser Smart Contract under the \tests sub-directory. To run these you will need to have [Truffle](https://www.trufflesuite.com/docs/truffle/overview) and [Ganache](https://www.trufflesuite.com/docs/ganache/overview) installed:
1) Edit the `\contracts\FundRaiser.sol` smart contract and un-comment the Test Functions section at the end of the contract (these are only used for testing purposes)
2) Open a terminal window/command prompt, change to the project directory and start a  local test node using `ganache-cli`, or statup Ganache for Windows
3) From another terminal window/command prompt, change to the project directory and enter `npm run test`.  This will compile the contract and then run the test suite using the Ganache blockchain
4) The Smart Contract has also been tested using [Solidity-Coverage](https://www.npmjs.com/package/solidity-coverage) to confirm all functions are fully tested. To run the tests, ensure Solidity-Coverage is installed and configured and then from the terminal window/command prompt run `npm run coverage` which will produce the coverage reports in the \coverage directory
5) The Smart Contract has also been verified through [MythX](https://mythx.io/). To run the verification process, ensure MythX is installed and configured and then from the terminal window/command prompt set your MYTHX_API_KEY and then run `npm run verify` to run the verification process. MythX is also available as a plug-in to Remix if preferred

## Project Structure
```powershell
ethfundraiser
  ├── build                   # Created by Truffle to hold the compiled smart contracts
  ├── contracts               # Contains the smart contract source files
  ├── coverage                # Created by solidity-coverage to hold the coverage reports
  ├── frontend                # Contains the front-end HTML, JavaScript and Image files
  ├── migrations              # Used by Truffle to handle smart contract deployments
  ├── node_modules            # Created by NPM to hold all the Node Modules and dependencies
  ├── test                    # Contains the test scripts
  ├ server.js                 # The Node.js WebServer Hosting application
  ├ ...                       # Various other configuration files used by the tools
```

## Future Updates/Ideas
- Review MetaMask breaking changes (due Q1/2020) and update app as required
- See if dApp can be used with other wallets such as MyCrypto Desktop and MyEtherWallet/MyCrypto web wallets
- Potential to improve method for iterating over a struct to remove votes during a refund rather than putting a hard-coded max limit on Spending Requests
