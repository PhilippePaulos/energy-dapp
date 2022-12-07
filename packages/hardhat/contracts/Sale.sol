// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./EEDToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Sale
 * @dev Sale is a contract for managing the eng token crowdsale,
 * allowing investors to purchase tokens with ether during a defined time frame.
 * An allowance is given by the contract holding the tokens to the Sale contract so it can sell a given amount of tokens
 */
contract Sale is Ownable {
    EEDToken eedToken;
    uint256 public closingTime;
    uint256 public rate;
    address public tokenWallet;
    uint256 public weiRaised;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokenPurchase(
        address purchaser,
        address beneficiary,
        uint256 value,
        uint256 amount
    );

    /**
     * @dev Constructor, takes token address, rate, closing time and token wallet.
     * @param _tokenAddress Token address
     * @param _rate Exchange rate
     * @param _closingTime Sale closing time
     * @param _tokenWallet Address holding the tokens, which has approved allowance to the crowdsale
     */
    constructor(
        address _tokenAddress,
        uint256 _rate,
        uint256 _closingTime,
        address _tokenWallet
    ) {
        require(
            _closingTime >= block.timestamp,
            "Closing time should be in the future"
        );
        require(_rate > 0);
        require(_tokenWallet != address(0));
        require(_tokenAddress != address(0));
        eedToken = EEDToken(_tokenAddress);
        rate = _rate;
        closingTime = _closingTime;
        tokenWallet = _tokenWallet;
    }

    /**
     * @dev fallback function
     */
    fallback() external payable {}

    /**
     * @dev receive function
     */
    receive() external payable {}

    /**
     * @dev Buy tokens as long as the sale is open
     * @return _tokenAmount
     */
    function buyTokens(address _beneficiary)
        public
        payable
        returns (uint256 _tokenAmount)
    {
        uint256 weiAmount = msg.value;

        require(block.timestamp <= closingTime);
        require(_beneficiary != address(0));
        require(weiAmount != 0);

        uint256 tokens = msg.value * rate;
        weiRaised = weiRaised += weiAmount;

        eedToken.transferFrom(tokenWallet, _beneficiary, tokens);
        emit TokenPurchase(msg.sender, _beneficiary, weiAmount, tokens);

        return tokens;
    }

    /**
     * @dev Checks the amount of tokens left in the allowance.
     * @return Amount of tokens left in the allowance
     */
    function remainingTokens() public view returns (uint256) {
        return eedToken.allowance(tokenWallet, address(this));
    }

    /**
     * @dev Withdraw tokens, only when sale is closed
     */
    function withdrawFunds() public onlyOwner {
        require(block.timestamp > closingTime, "Sale still ongoing");
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send balance to the owner");
    }

    /**
     * @dev Checks whether the period in which the sale is open has already elapsed.
     * @return bool sale period has elapsed
     */
    function hasClosed() public view returns (bool) {
        return block.timestamp > closingTime;
    }

    function getRate() public view returns (uint256) {
        return rate;
    }
}
