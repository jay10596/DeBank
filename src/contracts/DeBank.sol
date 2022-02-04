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
    }

    // Similar to declaring PK for adding data
    mapping(address => Account) public accounts;

    // Pass deployed Token address as argument(which comes from migration)
    constructor(Token _token) { 
        token = _token;
    }

    event acc(
        address id,
        uint balance
    );

    // Similar to declaring PK in DB (address = PK(id), uint = balance table)
    mapping(address => uint) public balance;

    function deposit() payable public {
        Account memory _account = accounts[msg.sender];
        // Increase the balance
        balance[msg.sender] = balance[msg.sender] + msg.value;
        // Add new tip to the post
        _account.balance = _account.balance + msg.value;

        // Update the actual product in blockchain
        accounts[msg.sender] = _account;

        emit acc(_account.id, _account.balance);
    }

    function withdraw() payable public {

    }
}



/*
Extra Notes:
    1) Why counter?
    Solidity doesn't tell us how many products are in Struct. It returns empty vals if you've 5 prods and search for 6. 

    2) What is state/public variable?
    Using public converts vaiable into function which can be used globally including console. More like auto increment PK.

    3) Why to trigger event?
    In Laravel, we return some value in the function. In solidity, we can trigger an event which will be passed as an argument in the callback of this function.

    4) What is msg.sender?
    It's the address of the person who calls the function i.e the one who makes the purchase with his wallet. In this case, msg. values come from metadata (msg.sender = from: buyer). 

    5) What is require() in a function?
    The function will throw an exception and will stop the execution if the condition is not correct in order to save gas fee.

    6) Why _ on parameters?
    _ is just for naming convention to differentiate local variables from state variables. 

    7) What is Product memory _product?
    Creates a duplicate copy of the product that exists in the blockchain and assigns it to the local variable _product. 

    8) What is payable?
    Solidity can't let you transfer money or use metadata(msg) value without payable function. The variable which contains owner address also must have payable.

    9) What happens ofter transfering the value?
    Check the Ganache network. The msg.sender/from: buyer (3rd account) will lose 1 eth and owner (2nd account) will gain one.   

    10) Why we use Wei?
    Solidity doesn't have decimal data type. Therefore, we have to convert decimal values (actual ETH) into wei. In other words, Eth = Dollar, Wei = Cent.
*/

