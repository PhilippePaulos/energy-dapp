# Energy DAO DApp project

## General Information
This project has been done to in the context of final project of Alyra Trainee. 
The smart contract developped consists on a DAO in order to validate projects sent by beneficiary and craftsmans to make energy economy.
First to participate people can buy token to vote or propose projects.
People can register as Craftman with validated documents, finally a quorum  of the dao will validate the craftman to participate.
Anyone who has enough token can propose a project and is called as beneficiary.
A validated craftsman can propose a quotation for a specific project.
Once period of proposal is done voters can vote for quotations.
Finally the best quotation is revealed and the benficiary has the choice to accept it or reject it.

## Media
TBD

## Website
TBD

## Voting contract

### Docs
[Voting.md](https://github.com/PhilippePaulos/voting-dapp/blob/main/client/src/contracts/Voting.md)

### Contract address
The contract is deployed in the Goerli testnet at TBD

## Technologies
* Solidity
* Javascript
* hardhat
* React
* Web3
* Material UI

## Local deployment

### Contract
You can deploy the contract in your local environment using the following comands:
```sh 
cd hardhat && npx hardhat run deploy/01_deploy_contracts.js --network localhost
```

Make sure that you have a local blockchain running in your machine and feel free to update the truffle-config.js file in order to match your local configuration:
```js
networks: {
    localhost: {
      chainId: 31337
    },
    ...
}
```

### Application
```sh 
cd client && npm install && npm start
```

## Gas Reporter
![alt test](https://github.com/PhilippePaulos/voting-dapp/blob/main/truffle/test/gas-reporter.PNG)

