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
            result = await token.changeMinter(deBank.address, {from: deployer})
            event = result.logs[0].args
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

            // FAILURE: deployer is not the minter anymore
            await token.changeMinter(deBank.address, {from: deployer}).should.be.rejectedWith(utils.EVM_REVERT) // Unauthorized minter
            await token.mintDBC(deployer, user, '1').should.be.rejectedWith(utils.EVM_REVERT)
        })
    })

    describe('DeBank', () => {
        let block

        describe('depositETH', async () => {
            // Similar to constructor()
            before(async () => {
                // Deposite 0.01 ETH in the bank
                result = await deBank.depositETH({ value: Number(web3.utils.toWei('0.01', 'Ether')), from: user})
                event = result.logs[0].args

                // Get the latest block
                block = await web3.eth.getBlock('latest');
            })

            it('balance has increased', async () => {
                // SUCCESS: Balance has increased in user's DeBank Account
                assert.equal(Number(event.balance), Number(web3.utils.toWei('0.01', 'Ether')))
                assert.isTrue(Number(event.balance) > 0)

                // FAILURE: Can't deposit if the amount is < 0.01 ETH
                await deBank.depositETH({ value: Number(web3.utils.toWei('0.001', 'Ether')), from: user}).should.be.rejectedWith(utils.EVM_REVERT)
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

            it('only user can withdraw', async () => {
                // FAILURE: Deployer doesn't have any deposit, hence accounts(deployer).active is null 
                await deBank.depositETH({ value: Number(web3.utils.toWei('0.01', 'Ether')), from: user })
                await utils.wait(2) // Accruing interest
                await deBank.withdrawETH({ from: deployer }).should.be.rejectedWith(utils.EVM_REVERT) // Fails because deployer doesn't have any deposit. Therefore, active is null
            })
        })

        // describe('testing borrow...', () => {
        //     describe('success', () => {
        //         beforeEach(async () => {
        //             await dbank.borrow({ value: 10 ** 16, from: user }) //0.01 ETH
        //         })

        //         it('token total supply should increase', async () => {
        //             expect(Number(await token.totalSupply())).to.eq(5 * (10 ** 15)) //10**16/2
        //         })

        //         it('balance of user should increase', async () => {
        //             expect(Number(await token.balanceOf(user))).to.eq(5 * (10 ** 15)) //10**16/2
        //         })

        //         it('collateralEther should increase', async () => {
        //             expect(Number(await dbank.collateralEther(user))).to.eq(10 ** 16) //0.01 ETH
        //         })

        //         it('user isBorrowed status should eq true', async () => {
        //             expect(await dbank.isBorrowed(user)).to.eq(true)
        //         })
        //     })

        //     describe('failure', () => {
        //         it('borrowing should be rejected', async () => {
        //             await dbank.borrow({ value: 10 ** 15, from: user }).should.be.rejectedWith(EVM_REVERT) //to small amount
        //         })
        //     })
        // })

        // describe('testing payOff...', () => {
        //     describe('success', () => {
        //         beforeEach(async () => {
        //             await dbank.borrow({ value: 10 ** 16, from: user }) //0.01 ETH
        //             await token.approve(dbank.address, (5 * (10 ** 15)).toString(), { from: user })
        //             await dbank.payOff({ from: user })
        //         })

        //         it('user token balance should eq 0', async () => {
        //             expect(Number(await token.balanceOf(user))).to.eq(0)
        //         })

        //         it('dBank eth balance should get fee', async () => {
        //             expect(Number(await web3.eth.getBalance(dbank.address))).to.eq(10 ** 15) //10% of 0.01 ETH
        //         })

        //         it('borrower data should be reseted', async () => {
        //             expect(Number(await dbank.collateralEther(user))).to.eq(0)
        //             expect(await dbank.isBorrowed(user)).to.eq(false)
        //         })
        //     })

        //     describe('failure', () => {
        //         it('paying off should be rejected', async () => {
        //             await dbank.borrow({ value: 10 ** 16, from: user }) //0.01 ETH
        //             await token.approve(dbank.address, (5 * (10 ** 15)).toString(), { from: user })
        //             await dbank.payOff({ from: deployer }).should.be.rejectedWith(EVM_REVERT) //wrong user
        //         })
        //     })
        // })
    })
})