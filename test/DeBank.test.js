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
    let token, deBank, result, event

    before(async () => {
        token = await Token.new() // Initialize token
        deBank = await DeBank.new(token.address)
    })

    describe('Token', () => {
        // Similar to constructor()
        before(async () => {
            result = await token.changeMinter(deBank.address, { from: deployer })
            event = result.logs[0].args

            // FAILURE: deployer is not the minter anymore
            await token.changeMinter(deBank.address, { from: deployer }).should.be.rejectedWith(utils.EVM_REVERT) // Unauthorized minter
            await token.mintDBC(deployer, user, '1').should.be.rejectedWith(utils.EVM_REVERT)
        })

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
            assert.equal(await event.from, deployer)
            assert.equal(await event.to, deBank.address)
            assert.equal(await token.minter(), deBank.address)
        })
    })

    describe('DeBank', () => {
        let walletBalance, block

        describe('depositETH', async () => {
            // Similar to constructor()
            before(async () => {
                // Fetch wallet before withdraw
                walletBalance = await web3.eth.getBalance(user)

                // Deposite 0.01 ETH in the bank
                result = await deBank.depositETH({ value: Number(web3.utils.toWei('0.01', 'Ether')), from: user })
                event = result.logs[0].args

                // Get the latest block
                block = await web3.eth.getBlock('latest');

                // FAILURE: Can't deposit if the amount is < 0.01 ETH
                await deBank.depositETH({ value: Number(web3.utils.toWei('0.001', 'Ether')), from: user }).should.be.rejectedWith(utils.EVM_REVERT)
                // FAILURE: Can't deposit when it's already isDeposited
                await deBank.depositETH({ value: Number(web3.utils.toWei('0.01', 'Ether')), from: user }).should.be.rejectedWith(utils.EVM_REVERT)
            })

            it('user deBank account balance has increased', async () => {
                // SUCCESS: Balance has increased in user's DeBank Account
                assert.equal(Number(event.balance), Number(web3.utils.toWei('0.01', 'Ether')))
                assert.isTrue(Number(event.balance) > 0)
            })

            it('user wallet balance has decreased', async () => {      
                // SUCCESS: Wallet balance is decreased after depositing ETH to deBank
                assert.isTrue(Number(await web3.eth.getBalance(user)) < Number(walletBalance)) // New wallet balance < old wallet balance
            })
                
            it('timestamp is updated', async () => {
                // SUCCESS: Timestamp is > 0 in user's DeBank Account
                assert.equal(Number(event.timestamp), Number(block.timestamp))
                assert.isTrue(Number(event.timestamp) > 0)
            })

            it('deBank has received the deposit', async () => {
                // SUCCESS: deBank receives the deposited amount
                assert.equal(Number(await web3.eth.getBalance(deBank.address)), event.balance)
            })
                
            it('deBank account is updated', async () => {
                // SUCCESS: Deposite is activated in user's DeBank Account
                assert.isTrue(event.isDeposited)
            })
        })

        describe('withdrawETH', () => {
            let account, walletBalance, dbc

            // Similar to constructor()
            before(async () => {
                // Fetch account data and wallet before withdraw
                account = await deBank.accounts(user)
                walletBalance = await web3.eth.getBalance(user)

                // Withdraw previously deposited ETH from the bank
                result = await deBank.withdrawETH({from: user})
                event = result.logs[0].args

                // Get the latest block
                block = await web3.eth.getBlock('latest');

                // FAILURE: user has withdrawn his deposit previously,
                await deBank.withdrawETH({ from: user }).should.be.rejectedWith(utils.EVM_REVERT) // Fails because user has already withdrawn the money
            })
                
            it('user deBank account balance is decreased', async () => {
                // SUCCESS: DeBank Account balance is back to 0
                assert.isTrue(Number(account.balance) > 0) // Previous balance is > 0
                assert.equal(Number(event.balance), 0)
            })
                
            it('user wallet balance is increased', async () => {      
                // SUCCESS: Wallet balance is increased after receving ETH back from deBank
                assert.isTrue(Number(await web3.eth.getBalance(user)) > Number(walletBalance)) // New wallet balance > old wallet balance
            })
                
            it('dbc balance and token supply increased', async () => {
                dbc = await token.balanceOf(user)
            
                // SUCCESS: DBC are minted based on the interest
                assert.isTrue(Number(dbc) > 0)
                assert.equal(Number(dbc), Number(event.interest))
                assert.equal(Number(await token.totalSupply()), Number(event.interest)) // Token supply increased
            })

            it('deBank has returned the deposit', async () => {
                // SUCCESS: deBank has returned the deposited eth
                assert.equal(Number(await web3.eth.getBalance(deBank.address)), 0)
            })
                
            it('deBank account is reset', async () => {
                // SUCCESS: Account is reset after withdraw
                assert.equal(Number(event.balance), 0)
                assert.equal(Number(event.timestamp), 0)
                assert.equal(event.balance, false)
            })
        })

        describe('borrowDBC', () => {
            let oldTotalSupply, oldBalanceDBC

            // Similar to constructor()
            before(async () => {
                // Get data of DBC before borrow
                oldTotalSupply = Number(await token.totalSupply()) // Previously minted DBC due to interest - 63419582
                oldBalanceDBC = Number(await token.balanceOf(user)) // DBC balance of the user - 63419582

                // Borrow (0.01 ETH / 2) DBC from the bank
                result = await deBank.borrowDBC({ value: Number(web3.utils.toWei('0.01', 'Ether')), from: user })
                event = result.logs[0].args

                // FAILURE: Collateral must be > 0.01 ETH
                await deBank.borrowDBC({ value: Number(web3.utils.toWei('0.0001', 'Ether')), from: user }).should.be.rejectedWith(utils.EVM_REVERT)
                // FAILURE: isDeposite is already set to true
                await deBank.borrowDBC({ value: Number(web3.utils.toWei('0.01', 'Ether')), from: user }).should.be.rejectedWith(utils.EVM_REVERT)
            })

            it('dbc total supply is increased', async () => {
                // SUCCESS: DBC are minted based on 50% of collateral
                assert.isTrue(Number(await token.totalSupply()) > Number(event.collateral) / 2) // 63419582 DBC were minted due to interest i.e. 5000000063419582 > 5000000000000000
                assert.equal(Number(await token.totalSupply()), Number(event.collateral) / 2 + oldTotalSupply) // 5000000063419582 = 5000000000000000 + 63419582
            })

            it('user dbc balance is increased', async () => {
                // SUCCESS: DBC balance of user is increased
                assert.isTrue(Number(await token.balanceOf(user)) > oldBalanceDBC) // 63419582 DBC were paid to user as interest i.e. 5000000063419582 > 63419582
                assert.equal(Number(await token.balanceOf(user)), Number(event.collateral) / 2 + oldBalanceDBC) // 5000000063419582 = 5000000000000000 + 63419582
            })

            it('user deBank account collateral is increased', async () => {
                // SUCCESS: Collateral in the DeBank account of the user has been increased
                assert.isTrue(Number(event.collateral) > 0)
                assert.equal(Number(event.collateral), Number(web3.utils.toWei('0.01', 'Ether')))
            })

            it('deBank has received the collateral', async () => {
                // SUCCESS: deBank receives the collateral amount
                assert.equal(Number(await web3.eth.getBalance(deBank.address)), event.collateral)
            })

            it('deBank account is updated', async () => {
                // SUCCESS: isBorrowed is set to true
                assert.isTrue(event.isBorrowed)
            })
        })

        describe('returnDBC', () => {
            let account, oldBalanceDBC, fee

            // Similar to constructor()
            before(async () => {
                // Get account data and dbc of user before return
                account = await deBank.accounts(user)
                oldBalanceDBC = Number(await token.balanceOf(user)) // DBC balance of the user - 5000000063419582

                // Return borrowed DBC to the bank
                await token.approve(deBank.address, Number(web3.utils.toWei('0.01', 'Ether')) / 2, { from: user })
                result = await deBank.returnDBC({ from: user })
                event = result.logs[0].args

                // FAILURE: Deployer hasn't borrowed any DBC
                await deBank.returnDBC({ from: deployer }).should.be.rejectedWith(utils.EVM_REVERT)
            })

            it('dbc balance is decreased', async () => {
                dbc = oldBalanceDBC - (account.collateral / 2) // Total DBC of user - borrowed BBC = 5000000063419582 - 5000000000000000
                
                // SUCCESS: Borrowed DBC has been returned
                assert.equal(Number(await token.balanceOf(user)), dbc) // 63419582
            })

            it('deBank has returned the collateral and kept 10% fee', async () => {
                fee = account.collateral / 10 // 10% of collateral
                
                // SUCCESS: deBank gets 10% of collateral fee (ETH)
                assert.equal(Number(await web3.eth.getBalance(deBank.address)), fee)
            })

            it('deBank account is reset', async () => {
                // SUCCESS: account data is reset after DBC return
                assert.equal(event.collateral, 0)
                assert.equal(event.isBorrowed, false)
            })
        })
    })
})