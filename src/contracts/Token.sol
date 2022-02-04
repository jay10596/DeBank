// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Token is a child of ERC20 class (Inheritance)
contract Token is ERC20 {
    // State variable
    address public minter;

    // Emit event when a post is created
    event MinterChanged(
        address indexed from,
        address to
    );

    // Constructor which takes Token name and symbol as params
    constructor() payable ERC20("Decentralized Bank Currency", "DBC") {
        minter = msg.sender;
    }
    
    function mintToken(address account, uint amount) public {
        // Check if msg.sender can mint
        require(msg.sender == minter, "Error: msg.sender doesn't have minter role");

        // Default mint function from ERC20
        _mint(account, amount);
    }

    // Initially the minter will be the deployer but deployer will give his role to the bank once Smart Contract deployed
    function changeMinter(address deBank) public returns (bool) {
        // Check if msg.sender has minter role
        require(msg.sender == minter, "Error: Only deployer can change minter");

        // Change minter from deployer to DeBank
        minter = deBank;

        // Trigger an event
        emit MinterChanged(msg.sender, deBank);

        return true;
    }
}