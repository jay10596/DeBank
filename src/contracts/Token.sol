// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Token is a child of ERC20 class (Inheritance)
contract Token is ERC20 {
    // State variable
    address public minter;

    // Emit event when minter is updated
    event MinterChanged(
        address indexed from,
        address to
    );

    // Constructor which takes Token name and symbol as params
    constructor() payable ERC20("Decentralized Bank Currency", "DBC") {
        minter = msg.sender;
    }

    // Initially the minter will be the deployer but deployer will give his role to the bank once Smart Contract deployed
    function changeMinter(address deBank) public {
        // Validation
        require(msg.sender == minter, "Error: Only deployer can change minter");

        // Update minter from deployer to DeBank
        minter = deBank;

        // Trigger an event
        emit MinterChanged(msg.sender, deBank);
    }
    
    function mintDBC(address deBank, address account, uint amount) public {
        // Validation
        require(deBank == minter, "Error: DeBank doesn't have minter role");

        // Default mint function from ERC20
        _mint(account, amount);
    }
}