const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-harhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name) ? describe.skip("FundMe")
    :
    describe("FundMe", () => {
        let fundMe
        let deployer
        const sendValue = ethers.utils.parseEther("0.1")
        const gasPrice = ethers.utils.parseUnits('140', 'gwei')

        beforeEach(async function () {
            const { deployer } = await getNamedAccounts()
            fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allows people to fund and withdraw", async () => {
            const fundTxResponse = await fundMe.fund({ value: sendValue, gasPrice })
            await fundTxResponse.wait(1)
            const withdrawTxResponse = await fundMe.withdraw()
            await withdrawTxResponse.wait(1)

            const endingContractBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingContractBalance.toString(), "0")
        })
    })