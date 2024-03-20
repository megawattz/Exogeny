// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PlaneteerNFT", function () {
  it("test initial value", async function () {
    const PlaneteerNFT = await ethers.getContractFactory("PlaneteerNFT");
    const PlaneteerNFT = await PlaneteerNFT.deploy();
    await PlaneteerNFT.deployed();
    console.log('PlaneteerNFT deployed at:'+ PlaneteerNFT.address)
    expect((await PlaneteerNFT.retrieve()).toNumber()).to.equal(0);
  });
   it("test updating and retrieving updated value", async function () {
    const PlaneteerNFT = await ethers.getContractFactory("PlaneteerNFT");
    const PlaneteerNFT = await PlaneteerNFT.deploy();
    await PlaneteerNFT.deployed();
    const PlaneteerNFT2 = await ethers.getContractAt("PlaneteerNFT", PlaneteerNFT.address);
    const setValue = await PlaneteerNFT2.store(56);
    await setValue.wait();
    expect((await PlaneteerNFT2.retrieve()).toNumber()).to.equal(56);
  });
});