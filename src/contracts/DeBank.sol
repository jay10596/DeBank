// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract DeBank {
    // State variables
    Token private token;

    // Equivalent to database
    struct Account {
        address id;
        uint balance;
        uint collateral;
        uint timestamp;
        bool isDeposited;
        bool isBorrowed;
    }

    // Similar to declaring PK for adding data
    mapping(address => Account) public accounts;

    // Emit event when ETH is deposited
    event DepositedETH (
        address id,
        uint balance,
        uint timestamp,
        bool isDeposited
    );

    // Emit event when ETH is withdrawn
    event WithdrawnEth (
        address id,
        uint balance,
        uint timestamp,
        bool isDeposited,
        uint interest
    );

    // Emit event when DBC is borrowed
    event BorrowedDBC (
        address id,
        uint collateral,
        bool isBorrowed,
        uint loan
    );

    // Emit event when DBC debt is forfeited (paid off)
    event ReturnedDBC(
        address id,
        uint collateral,
        bool isBorrowed,
        uint fee
    );

    // Pass deployed Token address as argument(which comes from migration)
    constructor(Token _token) {
        token = _token;
    }

    function depositETH() public payable {
        // Fetch account
        Account memory _account = accounts[msg.sender];

        // Validation
        require(msg.value >= 1e16, "Error: Deposite amount must be >= 0.01 ETH");
        require(_account.isDeposited == false, "Error: Deposit already exists. You need to withdraw first to make a new Deposit");

        // Upadate the account data
        _account.balance = msg.value;
        _account.timestamp = block.timestamp;
        _account.isDeposited = true;

        // Update the actual account in blockchain
        accounts[msg.sender] = _account;

        // Trigger an event
        emit DepositedETH(_account.id, _account.balance, _account.timestamp, _account.isDeposited);
    }

    function withdrawETH() public payable {
        // Fetch account
        Account memory _account = accounts[msg.sender];

        // Validation
        require(_account.isDeposited == true, "Error: This account doesn't have any active deposite");

        // Calculate interest
        uint period = block.timestamp - _account.timestamp;
        uint interestPerSecond = ((_account.balance * 10) / 100) / 31536000;
        uint interest = interestPerSecond * period;

        // Withdraw deposited ETH back to user's wallet
        payable(msg.sender).transfer(_account.balance);

        // Mint DBC token and pay the msg.sender
        token.mintDBC(address(this), msg.sender, interest);

        // Reset the account data
        _account.balance = 0;
        _account.timestamp = 0;
        _account.isDeposited = false;

        // Update the actual account in blockchain
        accounts[msg.sender] = _account;

        // Trigger an event
        emit WithdrawnEth(_account.id, _account.balance, _account.timestamp, _account.isDeposited, interest);
    }

    function borrowDBC() public payable {
        // Fetch account
        Account memory _account = accounts[msg.sender];

        // Validation
        require(msg.value >= 1e16, "Error: Collateral must be >= 0.01 ETH");
        require(_account.isBorrowed == false, "Error: Loan is already taken");

        // Lock ETH as collateral till the loan is paid off
        _account.collateral = _account.collateral + msg.value;

        // Calculate DBC to mint (50% of collateral)
        uint loan = _account.collateral / 2;

        // Mint DBC token and pay the msg.sender
        token.mintDBC(address(this), msg.sender, loan);

        // Upadate the account data
        _account.isBorrowed = true;

        // Update the actual account in blockchain
        accounts[msg.sender] = _account;

        // Trigger an event
        emit BorrowedDBC(msg.sender, _account.collateral, _account.isBorrowed, loan);
    }

    function returnDBC() public {
        // Fetch account
        Account memory _account = accounts[msg.sender];

        // Validation
        require(_account.isBorrowed == true, "Error: You don't have any active loan");

        // Transfer token from msg.sender to deBank (transferFrom returns bool, that's it's added within require for extra validation)
        require(token.transferFrom(msg.sender, address(this), _account.collateral / 2), "Error: Can't receive DBC"); // https://ethereum.org/en/developers/docs/standards/tokens/erc-20/

        // Calculate collateral fee (10%)
        uint fee = _account.collateral / 10;

        // Give back msg.sender's collateral ETH - fee
        payable(msg.sender).transfer(_account.collateral - fee);

        // Reset the account data
        _account.collateral = 0;
        _account.isBorrowed = false;

        // Trigger an event
        emit ReturnedDBC(msg.sender, _account.collateral, _account.isBorrowed, fee);
    }
}

/*
Extra Notes:
    1) Application logic
    Conditions:
        The contract is deployed by the deployer
        Once it's deployed, the ownership of the Token has been transfered to the DeBank right away
        Why? Because onlt DeBank should Mint new coins
        A user can deposit Eth (minimum 0.01)
        DeBank will calculate interest per second
        On withdraw, user will get back his dposit (ETH) and the earned interest will be paid in DBC
        A user can borrow DBC but has to put ETH as collateral
        He can borrow 50% DBC of collateral ETH amount
        He can return the debt
        DeBank will take his 10% fee on collateral amount and pay back the rest

    2) How to calculate interest?
    interest = interestPerSecond * period
        
    interestPerSecond =  10% of deposited money / seconds in a year
        10% of deposited money = 0.01 ETH * 10 / 100 = 1e16 / 10 = 1e15
        seconds in a year = 31536000
    interestPerSecond = 1e15 * 31536000 

    period = timestamp of the latest block - the timestamp when then money was deposited
    period = block.timestamp - _account.timestamp
*/
