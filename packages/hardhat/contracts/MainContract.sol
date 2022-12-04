// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "./EEDToken.sol";
import "./Sale.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MainContract
 * @dev Deployer mints the eng tokens and creates the token sale. 
 * It holds the remaining tokens
 */
contract MainContract is Ownable{

    // Amount of tokens to mint
    uint256 public mintAmount;

    /// Amount of tokens to sale
    uint256 public saleAmount;

    Sale public sale;

    EEDToken public token;

    /**
     * @dev Constructor
     * Mints `_mintAmount` tokens into the contract and starts the sale period that ends at `_saleClosingTime`.
     * `_saleAmount` tokens are given as allowance to the sale and are sold at `_saleRate`
     */
    constructor(uint _mintAmount, uint _saleAmount, uint _saleRate, uint _saleClosingTime) {
        require(_mintAmount >= _saleAmount, "Mint amount should be higher than sale amount");
        mintAmount = _mintAmount;
        saleAmount = _saleAmount;
        token = new EEDToken(_mintAmount);
        sale = new Sale(address(token), _saleRate, _saleClosingTime, address(this));
        token.approve(address(sale), _saleAmount);
    }

    /**
     * @dev Gets funds from `sale` into the contract
     */
    function getFunds() public onlyOwner {
        sale.withdrawFunds();
    }

    /**
     * @dev Sends funds to a given `_receiver`
     * @param _receiver Receiver address
     */
    function sendFunds(address _receiver) public onlyOwner {
        (bool sent, ) = _receiver.call{value: address(this).balance}("");
        require(sent, "Failed to send funds");
    }

    fallback() external payable {}
    
    receive() external payable {}

}

