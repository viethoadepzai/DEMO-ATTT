// sc06_app.js
let provider, signer, signerAddress;

// ABI tối giản cho các hàm cần gọi
let bankABI = [
    "function deposit() external payable",
    "function withdraw(uint256 amount) external",
    "function getBankBalance() external view returns (uint256)",
    "function getUserBalance(address user) external view returns (uint256)"
];

let attackABI_SC06 = [
    "function depositToBank() external payable",
    "function attackWithdraw(uint256 amount) external"
];

let bankContract, attackContract;
const statusEl = document.getElementById("status");

// 1. Connect MetaMask (giống hệt SC05)
document.getElementById("connectButton").onclick = async () => {
    if (!window.ethereum) {
        alert("Vui lòng cài đặt MetaMask!");
        return;
    }
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        signerAddress = await signer.getAddress();
        statusEl.innerText =
            "Đã kết nối với ví: " +
            signerAddress.substring(0, 6) +
            "..." +
            signerAddress.substring(38);
    } catch (err) {
        console.error(err);
        alert("Lỗi khi kết nối MetaMask: " + err.message);
    }
};

// Hàm tiện ích để setup contract (tương tự SC05)
function setupContractsSC06() {
    if (!provider || !signer) {
        alert("Chưa kết nối MetaMask!");
        return false;
    }

    const bankAddr = document.getElementById("bankAddr").value.trim();
    const attackAddr = document.getElementById("attackAddr").value.trim();

    if (!bankAddr || !attackAddr) {
        alert("Vui lòng nhập địa chỉ 2 hợp đồng!");
        return false;
    }

    try {
        bankContract = new ethers.Contract(bankAddr, bankABI, signer);
        attackContract = new ethers.Contract(attackAddr, attackABI_SC06, signer);
        statusEl.innerText = "Đã liên kết contract SC06. Sẵn sàng thao tác!";
        return true;
    } catch (err) {
        console.error(err);
        alert("Lỗi tạo instance contract: " + err.message);
        return false;
    }
}

// 3.1 Gửi 3 ETH vào Bank thông qua Attack
document.getElementById("btnDepositViaAttack").onclick = async () => {
    if (!setupContractsSC06()) return;
    statusEl.innerText = "Đang gửi 3 ETH từ Attack vào Bank...";

    try {
        const tx = await attackContract.depositToBank({
            value: ethers.utils.parseEther("3.0")
        });
        await tx.wait();
        statusEl.innerText = "✅ depositToBank() thành công. Attack đã gửi 3 ETH vào Bank.";
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi khi depositToBank: " + err.message;
    }
};

// 3.2 Chạy Attack (attackWithdraw 3 ETH)
document.getElementById("btnRunAttack").onclick = async () => {
    if (!setupContractsSC06()) return;
    statusEl.innerText = "Đang gọi attackWithdraw(3 ETH)...";

    try {
        const amount = ethers.utils.parseEther("3.0");
        const tx = await attackContract.attackWithdraw(amount);
        await tx.wait();
        statusEl.innerText =
            "✅ attackWithdraw() hoàn tất.\n" +
            "Nếu có lỗi SC06, Bank sẽ nghĩ đã gửi 3 ETH cho Attack, " +
            "nhưng thực tế ETH vẫn nằm trong Bank vì Attack từ chối nhận.";
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi khi attackWithdraw: " + err.message;
    }
};

// --- Các nút kiểm tra trạng thái ---

// Xem số dư ETH của Bank (address(this).balance)
document.getElementById("getBankBalance").onclick = async () => {
    if (!setupContractsSC06()) return;
    try {
        const bal = await bankContract.getBankBalance();
        statusEl.innerText =
            `Số dư ETH của Bank: ${ethers.utils.formatEther(bal)} ETH`;
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi khi xem số dư Bank: " + err.message;
    }
};

// Xem balances[Attack] trong Bank
document.getElementById("getAttackBalance").onclick = async () => {
    if (!setupContractsSC06()) return;
    try {
        const attackAddr = document.getElementById("attackAddr").value.trim();
        const bal = await bankContract.getUserBalance(attackAddr);
        statusEl.innerText =
            `balances[Attack] trong Bank: ${ethers.utils.formatEther(bal)} ETH`;
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi khi xem balances[Attack]: " + err.message;
    }
};

// Xem ETH của ví hiện tại (giống SC05)
document.getElementById("getMyEth").onclick = async () => {
    if (!provider || !signer) {
        alert("Chưa kết nối MetaMask!");
        return;
    }
    try {
        const bal = await provider.getBalance(signerAddress);
        statusEl.innerText =
            `ETH của ví hiện tại: ${ethers.utils.formatEther(bal)} ETH`;
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi khi xem ETH ví: " + err.message;
    }
};
