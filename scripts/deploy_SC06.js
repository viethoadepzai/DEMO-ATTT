// scripts/deploy_SC06.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);

  // 1. Deploy SC06_VulnerableBank
  const bank = await ethers.deployContract("SC06_VulnerableBank");
  await bank.waitForDeployment();
  console.log("SC06_VulnerableBank deployed to:", bank.target);

  // 2. Deploy SC06_Attack, truyền địa chỉ bank vào constructor
  const attack = await ethers.deployContract("SC06_Attack", [bank.target]);
  await attack.waitForDeployment();
  console.log("SC06_Attack deployed to:", attack.target);

  // 3. Deployer nạp sẵn 10 ETH vào Bank để demo
  const tx = await bank.deposit({ value: ethers.parseEther("10") });
  await tx.wait();
  console.log("Deployer deposited 10 ETH into SC06_VulnerableBank.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
