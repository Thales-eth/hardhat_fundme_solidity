const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-harhat-config")

!developmentChains.includes(network.name) ? describe.skip("Fund me")
    :
    describe("Fund me", () => {
        let fundMe
        let deployer
        let mockV3Aggregator
        const sentValue = ethers.utils.parseEther("1")

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
        })

        describe("constructor", async () => {
            it("sets the aggregator addresses correctly", async () => {
                const response = await fundMe.viewPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })

            it("sets the owner of the contract correctly", async () => {
                const owner = await fundMe.getOwner()
                assert.equal(owner, deployer)
            })
        })

        describe("fund", async () => {
            it("fails if dont send enough eth", async () => {
                await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough")
            })

            it("Updates the amountFunded data structure", async () => {
                await fundMe.fund({ value: sentValue })
                const amountFunded = await fundMe.getAmountFromAddress(deployer)
                assert.equal(amountFunded.toString(), sentValue.toString())
            })

            it("Adds funder to array of funders", async () => {
                await fundMe.fund({ value: sentValue })
                const funder = await fundMe.getFunder(0)
                assert.equal(funder, deployer)
            })
        })

        describe("Withdraw", async () => {
            beforeEach(async function () {
                await fundMe.fund({ value: sentValue })
            })

            it("Sender is the owner of the contract", async () => {
                const owner = await fundMe.getOwner()
                assert.equal(owner, deployer)
            })

            it("Attacker cannot withdraw eth", async () => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(
                    attackerConnectedContract.withdraw()
                ).to.be.reverted
            })

            it("widthdraw ETH from a single founder", async () => {
                // ARRANGE
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
                // ACT
                const transacitonResponse = await fundMe.withdraw()
                const transactionReceipt = await transacitonResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const totalGasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // ASSERT
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(totalGasCost).toString())
            })

            it("allows to withdraw with different funders", async () => {
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({ value: sentValue })
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // LLAMAR WITHDRAW
                const transacitonResponse = await fundMe.withdraw()
                const transactionReceipt = await transacitonResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const totalGasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(totalGasCost).toString())

                // MAKE SURE FUNDERS IS RESET
                await expect(fundMe.getFunder(0)).to.be.reverted


                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAmountFromAddress(accounts[i].address), 0)
                }

            })
        })
    })