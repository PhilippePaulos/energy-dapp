# Energy DAO DApp project

## General Information
This project has been done in the context of final project of Alyra Trainee. 
The DApp developed consists on a DAO in order to validate projects sent by beneficiary and craftsmans to make energy economy.
First to participate people can buy token to vote or propose projects.
People can register as Craftman with validated documents, finally a quorum  of the dao will validate the craftman to participate.
Anyone who has enough token can propose a project and is called as beneficiary.
A validated craftsman can propose a quotation for a specific project.
Once period of proposal is done voters can vote for quotations.
Finally the best quotation is revealed and the benficiary has the choice to accept it or reject it.

## Media
https://app.videas.fr/v/6abff012-85aa-46cc-af60-4c9c3f76c926/

## Website
https://energy-dapp.vercel.app/

## Voting contract

### Docs
[Energy.md](https://github.com/PhilippePaulos/energy-dapp/blob/features/packages/hardhat/README.md)

### Contract address
The contract is deployed in the Goerli testnet at 0x55ecc2A7AE246B24e8485a9AAA6c31f9e5275ed5

## Technologies
* Solidity
* Javascript
* Hardhat
* Ethers.js
* React
* Wagmi
* Material UI

## Local deployment

### Contract
You can deploy the contract in your local environment using the following comands:
```sh 
cd packages/hardhat && npm run deployLocal
```

Make sure that you have a local blockchain running in your machine and feel free to update the hardhat.config.js file in order to match your local configuration:
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
cd packages/front && npm install && npm start
```

## Gas Reporter
![alt test](https://github.com/PhilippePaulos/energy-dapp/blob/main/gas_reporter.jpg)

