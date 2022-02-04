/* eslint-disable no-undef */
const Token = artifacts.require("Token");
const DeBank = artifacts.require("DeBank");

module.exports = async function(deployer) {
    // Deploy Token
    await deployer.deploy(Token);

    // Deploy DeBank and pass token address for future minting
    const token = await Token.deployed()

    await deployer.deploy(DeBank, token.address);

    // Change token's minter from deployer to DeBank
    const deBank = await DeBank.deployed()

    await token.changeMinter(deBank.address)
};
