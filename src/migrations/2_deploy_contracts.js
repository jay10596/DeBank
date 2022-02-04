/* eslint-disable no-undef */
const Token = artifacts.require("Token");
const DeBank = artifacts.require("DeBank");

module.exports = function (deployer) {
    // Deploy Token
    deployer.deploy(Token);
    deployer.deploy(DeBank);
};
