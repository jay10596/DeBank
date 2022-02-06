// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Token.sol';

contract DeBank {
    // State variables
    Token private token;    

    // Equivalent to database
    struct Account {
        address id;
        uint balance;
        uint timestamp;
        bool active;
    }

    // Similar to declaring PK for adding data
    mapping(address => Account) public accounts;

    // Emit event when ETH is deposited
    event DepositedETH (
        address id,
        uint balance,
        uint timestamp,
        bool active
    );

    // Emit event when ETH is withdrawn
    event WithdrawnEth (
        address id,
        uint balance,
        uint timestamp,
        bool active,
        uint period,
        uint interest
    );

    // Pass deployed Token address as argument(which comes from migration)
    constructor(Token _token) { 
        token = _token;
    }

    function depositETH() payable public {
        // Fetch account
        Account memory _account = accounts[msg.sender];

        // Validation
        require(msg.value >= 1e16, "Error: Deposite amount must be >= 0.01 ETH");
        require(_account.active == false, "Error: Active deposite. You need to withdraw first to make a new Deposit");

        // Update the balance, timestamp and status
        _account.balance = msg.value;
        _account.timestamp = block.timestamp;
        _account.active = true;

        // Update the actual account in blockchain
        accounts[msg.sender] = _account;

	    // Trigger an event
        emit DepositedETH(_account.id, _account.balance, _account.timestamp, _account.active);
    }

    function withdrawETH() payable public {
        // Fetch account
        Account memory _account = accounts[msg.sender];

        // Validation
        require(_account.active == true, "Error: This account doesn't have any active deposite");

        // Calculate interest
        uint period = block.timestamp - _account.timestamp;
        uint interestPerSecond = (_account.balance * 10 / 100) / 31536000;
        uint interest = interestPerSecond * period;

        // Withdraw deposited ETH back to user's wallet
        payable(msg.sender).transfer(_account.balance);

        // Mint DBC token
        token.mintDBC(address(this), msg.sender, interest); // Pay interest in DBC token

        // Reset Accunt data
        _account.balance = 0;
        _account.timestamp = 0;
        _account.active = false; 

        // Update the actual account in blockchain
        accounts[msg.sender] = _account;

	    // Trigger an event
        emit WithdrawnEth(_account.id, _account.balance, _account.timestamp, _account.active, period, interest);
    }
}



/*
Extra Notes:
    1) How to calculate interest?
    interest = interestPerSecond * period
        
    interestPerSecond =  10% of deposited money / seconds in a year
        10% of deposited money = 0.01 ETH * 10 / 100 = 1e16 / 10 = 1e15
        seconds in a year = 31536000
    interestPerSecond = 1e15 * 31536000 

    period = timestamp of the latest block - the timestamp when then money was deposited
    period = block.timestamp - _account.timestamp
*/

