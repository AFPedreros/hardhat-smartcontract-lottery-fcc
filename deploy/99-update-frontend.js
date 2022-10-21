const { ethers } = require("hardhat")

const FRONTEND_ADDRESSES_FILE =
    "../nextjs-smartcontract-lottery-fcc/constants/contractAddresses.json"
const FRONTEND_ABI_FILE = "../nextjs-smartcontract-lottery-fcc/constants/abi.json"

module.exports = async () => {
    if (process.env.UPDATE_FRONTEND) {
        console.log("Updating frontend...")
        updateContractAddresses()
    }
}

const updateContractAddresses = async () => {
    const lottery = await ethers.getContract("Lottery")
}
