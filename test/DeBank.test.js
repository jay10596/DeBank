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
    const interestPerSecond = 31668017 // (10% APY) for min. deposit (0.01 ETH)

    before(async () => {
        // Same steps as migration
        token = await Token.new() // Use new() for ERC tokens
        deBank = await DeBank.deployed(token.address)

        await token.changeMinter(deBank.address, { from: deployer })
    })

    describe('Token', () => {
        describe('SUCCESS:', () => {
            it('has correct name', async () => {
                expect(await token.name()).to.be.eq('Decentralized Bank Currency')
                // Same as: assert.equal(await token.name(), 'Decentralized Bank Currency') 
            })

            it('has correct symbol', async () => {
                expect(await token.symbol()).to.be.eq('DBC')
            })

            it('has correct initial total supply', async () => {
                expect(Number(await token.totalSupply())).to.eq(0)
            })

            it('has transfered minter role to DeBank', async () => {
                expect(await token.minter()).to.eq(deBank.address)
            })
        })

        describe('FAILURE:', () => {
            it('deployer is not the minter anymore', async () => {
                await token.changeMinter(deBank.address, { from: deployer }).should.be.rejectedWith(utils.EVM_REVERT)
            
                await token.mintToken(user, '1', { from: deployer }).should.be.rejectedWith(utils.EVM_REVERT) //unauthorized minter
            })
        })
    })

    describe('DeBank (Deposit)', () => {
        let result

        describe('SUCCESS:', () => {
            before(async () => {
                // Deposite Eth
                result = await deBank.deposit({value: web3.utils.toWei('1', 'Ether'), from: user}) //0.01 ETH
            })

            it('balance is increased', async () => {
                expect(Number(await deBank.balance(user))).to.eq(Number(web3.utils.toWei('1', 'Ether')))

                console.log(result.logs[0].args.balance.toString(), Number(await deBank.balance(user)))
            })

            // it('deposit time is > 0', async () => {
            //     expect(Number(await deBank.depositStart(user))).to.be.above(0)
            // })

            // it('deposit status is true', async () => {
            //     expect(await deBank.isDeposited(user)).to.eq(true)
            // })
        })

        // describe('FAILURE:', () => {
        //     it('depositing should be rejected', async () => {
        //         await deBank.deposit({value: 10**15, from: user}).should.be.rejectedWith(utils.EVM_REVERT) //to small amount
        //     })
        // })
    })

    // describe('SocialMedia', () => {
    //     it('deploys successfully', async () => {
    //         const address = await socialMedia.address

    //         // SUCCESS: SocialMedia deployed successfully
    //         assert.notEqual(address, 0x0)
    //         assert.notEqual(address, '')
    //         assert.notEqual(address, null)
    //         assert.notEqual(address, undefined)
    //     })

    //     it('has a name', async () => {
    //         const name = await socialMedia.name()

    //         // SUCCESS: SocialMedia has correct name
    //         assert.equal(name, 'A Decentralized Bank')
    //         assert.notEqual(name, 0x0)
    //         assert.notEqual(name, '')
    //         assert.notEqual(name, null)
    //         assert.notEqual(name, undefined)
    //     })

    //     it('has a default post', async () => {
    //         postCount = await socialMedia.postCount()
    //         post = await socialMedia.posts(postCount) // Last post

    //         // SUCCESS: post created successfully
    //         assert.equal(postCount, 1, 'post exists')
    //         assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
    //         assert.equal(post.content, 'This is a Default Post', 'content is correct')
    //         assert.equal(post.mediaHash, '', 'mediaHash is empty')
    //         assert.equal(post.tip, '0', 'tip is correct')
    //         assert.equal(post.author, deployer, 'author is correct')
    //     })
    // })

    // describe('Posts', () => {
    //     let result

    //     it('creates post', async () => {
    //         // Create a post
    //         result = await socialMedia.createPost('This is my new post', 'QmfMcrTEwmHVZ32Za91corCmtofVJ1dri722oUT3bhaQsX', 0, { from: author })
    //         postCount = await socialMedia.postCount()

    //         const event = result.logs[0].args

    //         // SUCCESS: Post created successfully
    //         assert.equal(postCount, 2)
    //         assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
    //         assert.equal(event.content, 'This is my new post', 'content is correct')
    //         assert.equal(event.mediaHash, 'QmfMcrTEwmHVZ32Za91corCmtofVJ1dri722oUT3bhaQsX', 'mediaHash is correct')
    //         assert.equal(event.tip, '0', 'total tip amount is correct')
    //         assert.equal(event.author, author, 'author is correct')

    //         // FAILURE: Post couldn't be created with missing params 
    //         /*
    //          * These tests will fail because in the contract, we've require() for these params
    //          */
    //         await socialMedia.createPost('', 'QmfMcrTEwmHVZ32Za91corCmtofVJ1dri722oUT3bhaQsX', 0, { from: author }).should.be.rejected
    //         await socialMedia.createPost('This is my new post', 'QmfMcrTEwmHVZ32Za91corCmtofVJ1dri722oUT3bhaQsX', web3.utils.toWei('1', 'Ether'), { from: author }).should.be.rejected
    //     })

    //     it('displays post', async () => {
    //         // Fetch a post
    //         post = await socialMedia.posts(postCount) // Last post

    //         // SUCCESS: Product displayed successfully
    //         assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
    //         assert.equal(post.content, 'This is my new post', 'content is correct')
    //         assert.equal(post.mediaHash, 'QmfMcrTEwmHVZ32Za91corCmtofVJ1dri722oUT3bhaQsX', 'mediaHash is correct')
    //         assert.equal(post.tip, '0', 'total tip amount is correct')
    //         assert.equal(post.author, author, 'author is correct')
    //     })

    //     it('tips post', async () => {
    //         let ownerOldBalance, ownerNewBalance, tip

    //         // Owner's balance before purchase
    //         ownerOldBalance = await web3.eth.getBalance(author)
    //         ownerOldBalance = new web3.utils.BN(ownerOldBalance)

    //         // Update post
    //         result = await socialMedia.tipPost(postCount, { from: reader, value: web3.utils.toWei('2', 'Ether') })
    //         const event = result.logs[0].args

    //         // SUCCESS: Post tipped successfully
    //         assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
    //         assert.equal(event.content, 'This is my new post', 'content is correct')
    //         assert.equal(event.mediaHash, 'QmfMcrTEwmHVZ32Za91corCmtofVJ1dri722oUT3bhaQsX', 'mediaHash is correct')
    //         assert.equal(event.tip, '2000000000000000000', 'total tip amount is correct')
    //         assert.equal(event.author, author, 'author is correct')

    //         // Auther's balance after getting tipped
    //         ownerNewBalance = await web3.eth.getBalance(author)
    //         ownerNewBalance = new web3.utils.BN(ownerNewBalance)

    //         // SUCCESS: Owner received payment successfully
    //         tip = web3.utils.toWei('2', 'Ether')
    //         tip = new web3.utils.BN(tip)
    //         const updatedBalance = ownerOldBalance.add(tip)

    //         assert.equal(ownerNewBalance.toString(), updatedBalance.toString())

    //         // FAILURE: Post didn't have valid id
    //         await socialMedia.tipPost(99, { from: reader, value: web3.utils.toWei('2', 'Ether') }).should.be.rejected

    //         // FAILURE: There wasn't enough ETH in transation
    //         await socialMedia.tipPost(postCount, { from: reader, value: web3.utils.toWei('0', 'Ether') }).should.be.rejected

    //         // FAILURE: Author can't tip his own post
    //         await socialMedia.tipPost(postCount, { from: author, value: web3.utils.toWei('2', 'Ether') }).should.be.rejected
    //     })
    // })
})