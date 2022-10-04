const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Test", async () => {
          let lottery, lotteryContract, vrfCoordinatorV2Mock, entranceFee, player, interval
          const chainId = network.config.chainId

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              player = accounts[1]
              await deployments.fixture(["all"])
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              lotteryContract = await ethers.getContract("Lottery")
              lottery = lotteryContract.connect(player)
              entranceFee = await lottery.getEntranceFee()
              interval = await lottery.getInterval()
          })
          describe("constructor", async () => {
              it("Initializes the lottery correctly", async () => {
                  const lotteryState = await lottery.getLotteryState()

                  assert.equal(lotteryState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })
          describe("enterLottery", async () => {
              it("Reverts if you don't pay enough", async () => {
                  await expect(lottery.enterLottery()).to.be.revertedWith(
                      "Lottery__NotEnoughETHEntered"
                  )
              })
              it("Records players when they enter", async () => {
                  await lottery.enterLottery({ value: entranceFee })
                  const playerFromContract = await lottery.getPlayer(0)
                  assert.equal(player.address, playerFromContract)
              })
              it("Emits event on enter", async () => {
                  await expect(lottery.enterLottery({ value: entranceFee })).to.emit(
                      lottery,
                      "LotteryEnter"
                  )
              })
              it("Doesn't allow entrance when raffle is calculating", async () => {
                  await expect(lottery.enterLottery({ value: entranceFee }))
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  // we pretend to be a Chainlink keeper
                  await lottery.performUpkeep([])
                  await expect(lottery.enterLottery({ value: entranceFee })).to.be.revertedWith(
                      "Lottery__NotOpen"
                  )
              })
          })
      })
