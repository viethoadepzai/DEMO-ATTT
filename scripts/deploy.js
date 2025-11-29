// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [owner, attacker] = await ethers.getSigners();

  console.log("Deploying VulnerableAuction (Nhan vien)...");
  const VulnerableAuction = await ethers.getContractFactory("Auction", owner); // Tên "Auction" trong file VulnerableAuction.sol
  
  // --- PHẦN SỬA LỖI ---
  // 1. Deploy contract MÀ KHÔNG GỬI ETH
  console.log("Buoc 1: Deploy hop dong...");
  const auction = await VulnerableAuction.deploy(); // Bỏ { value: ... }
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  
  console.log("=> VulnerableAuction deployed to:", auctionAddress);

  // 2. Nạp 10 ETH SAU KHI deploy (dùng 'owner' signer)
  console.log("Buoc 2: Nguoi chu (Victim) nap 10 ETH vao quy...");
  const fundTx = await owner.sendTransaction({
      to: auctionAddress,
      value: ethers.parseEther("10.0")
  });
  await fundTx.wait();
  console.log("=> Da nap 10 ETH thanh cong.");
  // --- KẾT THÚC PHẦN SỬA ---

  console.log("\nDeploying Attack contract (Hacker)...");
  const Attack = await ethers.getContractFactory("AuctionAttack", attacker); // Tên "AuctionAttack" trong file Attack.sol
  const attack = await Attack.deploy(auctionAddress); // Trỏ vào địa chỉ auction
  await attack.waitForDeployment();
  const attackAddress = await attack.getAddress();

  console.log("=> Attack contract deployed to:", attackAddress);

  console.log("\n--- Deployment Complete ---");
  console.log("--- Copy 2 dia chi nay vao 'index.html' ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});