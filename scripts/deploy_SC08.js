const hre = require("hardhat");

async function main() {
  console.log("Dang deploy contract SC08_Overflow...");
  
  // Lấy account mặc định (Account 0) để deploy
  const [deployer] = await hre.ethers.getSigners();

  const SC08 = await hre.ethers.getContractFactory("SC08_Overflow");
  const sc08 = await SC08.deploy();
  await sc08.waitForDeployment();

  const contractAddress = await sc08.getAddress();

  console.log("------------------------------------------------");
  console.log("SC08_Overflow deployed to:", contractAddress);
  
  // --- MỚI: Nạp 1000 ETH vào Contract ---
  console.log("Dang nap 1000 ETH vao Contract...");
  await deployer.sendTransaction({
    to: contractAddress,
    value: hre.ethers.parseEther("1000.0")
  });
  console.log("-> Da nap xong! Contract gio da co 1000 ETH.");
  console.log("------------------------------------------------");
  console.log("-> Copy dia chi tren va dan vao file overflow_app.js (hoac o input tren web)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});