const { ethers } = require("hardhat");

async function main() {
  const [owner, attacker] = await ethers.getSigners();

  console.log("Deployer (Victim):", owner.address);
  console.log("Attacker account  :", attacker.address);

  console.log("\nDeploying Auction (SC05_VulnerableAuction.sol)...");

  // TÊN CONTRACT = chữ sau từ khóa `contract` trong SC05_VulnerableAuction.sol
  const VulnerableAuction = await ethers.getContractFactory("Auction", owner);

  // 1. Deploy contract KHÔNG gửi ETH kèm theo
  const auction = await VulnerableAuction.deploy();
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  console.log("=> Auction deployed to:", auctionAddress);

  // 2. Nạp 10 ETH sau khi deploy (Victim = owner)
  console.log("Victim nạp 10 ETH vào Auction...");
  const fundTx = await owner.sendTransaction({
    to: auctionAddress,
    value: ethers.parseEther("10.0"),
  });
  await fundTx.wait();
  console.log("=> Đã nạp 10 ETH vào Auction.\n");

  console.log("Deploying AuctionAttack (SC05_Attack.sol)...");

  // TÊN CONTRACT = chữ sau từ khóa `contract` trong SC05_Attack.sol
  const Attack = await ethers.getContractFactory("AuctionAttack", attacker);
  const attack = await Attack.deploy(auctionAddress);
  await attack.waitForDeployment();
  const attackAddress = await attack.getAddress();
  console.log("=> AuctionAttack deployed to:", attackAddress);

  console.log("\n--- Deployment Complete ---");
  console.log("Copy 2 địa chỉ này vào sc05.html:");
  console.log("Auction        :", auctionAddress);
  console.log("AuctionAttack  :", attackAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
