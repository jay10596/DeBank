const { assert } = require('chai')
const utils = require('../src/helpers/utils')

/* eslint-disable no-undef */
const Token = artifacts.require("Token")
const DeBank = artifacts.require("DeBank")

// Required for Failure tests (should.be.rejected)
require('chai')
    .use(require('chai-as-promised'))
    .should()

// Equivalent to [accounts[0], accounts[1], accounts[2]] 
contract(DeBank, ([deployer, user]) => {
    let token, deBank

    before(async () => {
        // Same steps as migration
        token = await Token.new() // Initialize token
        deBank = await DeBank.deployed(token.address)

        await token.changeMinter(deBank.address, {from: deployer})
    })

    describe('Token', () => {
        it('deployment', async () => {
            const address = await token.address

            // SUCCESS: SocialMedia deployed successfully
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await token.name()

            // SUCCESS: SocialMedia has correct name and type
            assert.equal(name, 'Decentralized Bank Currency')
            assert.typeOf(name, 'string')
        })

        it('has a symbol', async () => {
            const symbol = await token.symbol()

            // SUCCESS: SocialMedia has correct name and type
            assert.equal(symbol, 'DBC')
            assert.typeOf(symbol, 'string')
        })

        it('has correct initial total supply', async () => {
            // SUCCESS: SocialMedia has 0 initial supply
            assert.equal(await token.totalSupply(), '0')
        })

        it('has transfered minter role', async () => {
            // SUCCESS: deployer has has transfered minter role to DeBank
            assert.equal(await token.minter(), deBank.address)

            // FAILURE: deployer is not the minter anymore
            await token.changeMinter(deBank.address, { from: deployer }).should.be.rejectedWith(utils.EVM_REVERT) // Unauthorized minter
            // await token.mintDBC(deBank.address, user, '1', { from: deployer }).should.be.rejectedWith(utils.EVM_REVERT) 
        })
    })

    describe('DeBank', () => {
        let result, event, block

        describe('depositETH', async () => {
            // Similar to constructor()
            before(async () => {
                // Deposite 0.01 ETH in the bank
                result = await deBank.depositETH({value: Number(web3.utils.toWei('0.01', 'Ether')), from: user})
                event = result.logs[0].args

                // Get the latest block
                block = await web3.eth.getBlock('latest');
            })

            it('balance has increased', async () => {
                // SUCCESS: Balance has increased in user's DeBank Account
                assert.equal(Number(event.balance), Number(web3.utils.toWei('0.01', 'Ether')))
                assert.isTrue(Number(event.balance) > 0)

                // FAILURE: Can't deposit if the amount is < 0.01 ETH
                await deBank.depositETH({value: Number(web3.utils.toWei('0.001', 'Ether')), from: user}).should.be.rejectedWith(utils.EVM_REVERT)
            })

            it('timestamp has updated', async () => {
                // SUCCESS: Timestamp is > 0 in user's DeBank Account
                assert.equal(Number(event.timestamp), Number(block.timestamp))
                assert.isTrue(Number(event.timestamp) > 0)
            })

            it('status is activated', async () => {
                // SUCCESS: Deposite is activated in user's DeBank Account
                assert.isTrue(event.active)

                // FAILURE: Can't deposit when it's already active
                await deBank.depositETH({value: Number(web3.utils.toWei('0.01', 'Ether')), from: user}).should.be.rejectedWith(utils.EVM_REVERT)
            })
        })

        describe('withdrawETH', () => {   
            let account, walletBalance, dbc
            
            // Similar to constructor()
            before(async () => {
                // Fetch account data and wallet before withdraw
                account = await deBank.accounts(user)
                walletBalance = await web3.eth.getBalance(user)
                token = await Token.deployed() // use the deployed token

                // Withdraw previously deposited ETH from the bank
                result = await deBank.withdrawETH({from: user})
                event = result.logs[0].args

                // Get the latest block
                block = await web3.eth.getBlock('latest');
            })

            it('balance is decreased', async () => {
                // SUCCESS: DeBank Account balance is back to 0
                assert.isTrue(Number(account.balance) > 0) // Previous balance is > 0
                assert.equal(Number(event.balance), 0)
            })
        
            it('wallet balance is increased', async () => {
                // SUCCESS: Wallet balance is increased after receving ETH back
                assert.isTrue(Number(await web3.eth.getBalance(user)) > Number(walletBalance)) // New wallet balance > old wallet balance
            })

            it('dbc balance increased', async () => {
                dbc = await token.balanceOf(user)

                // SUCCESS: DBC are minted based on the interest
                assert.isTrue(Number(dbc) > 0) 
                assert.equal(Number(dbc), Number(event.interest))         
            })
        
            it('reset account', async () => {
                // SUCCESS: Account is reset after withdraw
                assert.equal(Number(event.balance), 0) 
                assert.equal(Number(event.timestamp), 0) 
                assert.equal(event.balance, false) 
            })
        
            it('only user can withdraw', async () =>{
                // FAILURE: Deployer doesn't have any deposit, hence accounts(deployer).active is null 
                await deBank.depositETH({value: Number(web3.utils.toWei('0.01', 'Ether')), from: user})
                await utils.wait(2) // Accruing interest
                await deBank.withdrawETH({from: deployer}).should.be.rejectedWith(utils.EVM_REVERT) // Fails because deployer doesn't have any deposit. Therefore, active is null
            })
        })
    })
})