async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("FUNDING CONTRACT...")
    const withdrawResponse = await fundMe.withdraw()
    await withdrawResponse.wait(1)
    console.log("Withdrawn!!!")
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err)
        process.exit(1)
    })