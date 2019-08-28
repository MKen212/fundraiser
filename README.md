# fundraiser
A Fund Raising Smart Contract with voting used to release payments.

## Overview
This Smart Contract provides the following functionality:
- The Fund Raiser deploys the smart contract with a set duration, a financial goal and a minimum contribution amount
- Contributors send Ether to this contract
- Once the goal is reached, the Fund Raiser issues a Spending Request of a value up to the total amount contributed to identify what the contribution money will be spent on
- Contributors vote for the Spending Request
- If the Spending Request receives votes of over 50% of the total contributors then the value requested can be released

## Duration and Deadlines
This Smart Contract sets a deadline for the Fund Raising Campaign, after which the money raised can be spent, or if the goal has not been reached then the contributors can retrieve their contributions. The current settings of Ethereum (mainnet and most testnets) is to create a new block roughly every 15 seconds. Therefore, the duration for this Smart Contract is set in "blocks".

## Contract Deployment
The Smart Contract can be compiled and deployed through [remix](https://remix.ethereum.org/) or using [truffle](https://www.trufflesuite.com/truffle).
Constructor values required at deployment are:
- _duration - In "blocks" of 15 seconds, e.g. 1 hour = 240; 1 day = 5760; 1 week = 40320
- _goal - Financial goal in wei, e.g. 1ETH = 1000000000000000000
- _minimumContribution - Minimum amount required for each contribution, in wei

In addition, the Ethereum address used to deploy the Smart Contract is set as the "owner" and certain functions can only be performed by the owner.

## Contract Usage

### Contributions
Contributors use the ```contribute``` function of the contract and submit their transaction with an Ether amount of at least the minimum contribution amount.

### Spending Requests
Once the deadline has passed, and so long as the goal has been reached, the contract owner can create a spending request using the ```createRequest``` function together with the following data:
- _description - A description of what the money will be spent on
- _value - The amount being spent with this spending request
- _recipient - The Ethereum address of where the money will be sent

Each spending request is stored sequentially starting from record 0.

### Voting
Each contributor can then use the ```voteForRequest``` function (followed by the record number) to vote for a specific request

### Releasing Payment
If over 50% of the contributors vote for the Spending Request the owner can then use the ```releasePayment``` function (followed by the record number) to send the agreed value to the requested recipient address

### Refunds
If the amount raised does not reach the goal defined, AND the contract duration has passed, the contributors can use the ```getRefund``` function to retrieve their full contribution.

### Other viewing functions
The following view-only functions are also available on the contract:
- amountRaised - Shows the total amount raised to date for the contract
- contributions (follwed by address) - Shows the contribtion amount from the specific address
- deadline - Shows the deadline of the contract as a block number
- goal - Shows the goal of the contract in wei
- hasVoted (followed by spendingRequest record number and address) - Shows if the specific address has voted for the specific Spending Request
- owner - Shows the Ethereum address of the Smart Contract owner
- requests (followed by spendingRequest record number) - Shows the details held of the spending request record, including description, value, recipient, completed flag and number of voters
- totalContributors - Shows the total number of contributors

## Credits
The concept and some of the initial coding for this Smart Contract was based on an article written by Ankit Brahmbhatt: [Learning Solidity with a Simple Fundraising Smart Contract](https://medium.com/quick-code/learning-solidity-with-a-simple-fundraising-smart-contract-2fad8b1d8b73)
