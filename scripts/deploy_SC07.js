const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Dang dung tai khoan deploy:", deployer.address);

  // 1. Deploy Ngân hàng
  const FlashLoanPool = await hre.ethers.getContractFactory("FlashLoanPool");
  const pool = await FlashLoanPool.deploy();
  await pool.waitForDeployment();
  console.log("FlashLoanPool deployed to:", pool.target);

  // Vẫn nạp 1000 ETH cho Ngân hàng (Cái này giữ nguyên để có tiền cho vay)
  await deployer.sendTransaction({
    to: pool.target,
    value: hre.ethers.parseEther("1000.0"),
  });
  console.log("-> Da nap 1000 ETH vao Pool");

  // 2. Deploy Nạn nhân (Governance)
  const VulnerableGovernance = await hre.ethers.getContractFactory("VulnerableGovernance");
  const governance = await VulnerableGovernance.deploy();
  await governance.waitForDeployment();
  console.log("VulnerableGovernance deployed to:", governance.target);

  // --- THAY ĐỔI Ở ĐÂY: KHÔNG NẠP 100 ETH TỰ ĐỘNG NỮA ---
  // (Chúng ta sẽ nạp bằng tay trên Web)
  console.log("-> Governance dang rong tui (0 ETH). Hay nap tren web!");

  // 3. Deploy Hacker
  const FlashLoanAttack = await hre.ethers.getContractFactory("FlashLoanAttack");
  const attack = await FlashLoanAttack.deploy(pool.target, governance.target);
  await attack.waitForDeployment();
  console.log("FlashLoanAttack deployed to:", attack.target);

  console.log("--- Deployment Complete ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});