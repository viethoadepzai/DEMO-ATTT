// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SC06: Unchecked External Calls
// Bank cho phép gửi/rút tiền, nhưng khi gửi ETH ra ngoài
// lại KHÔNG kiểm tra biến success của low-level call.
contract SC06_VulnerableBank {
    mapping(address => uint256) public balances;

    // Gửi tiền vào Bank
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // ❌ LỖI: dùng .call nhưng KHÔNG kiểm tra success
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough funds");

        // External call tới msg.sender
        (bool success, ) = payable(msg.sender).call{value: amount}("");

        // LỖI SC06: lẽ ra phải require(success)
        // if (!success) revert("Transfer failed");

        // Hợp đồng vẫn trừ số dư dù call có thể đã FAIL
        balances[msg.sender] -= amount;
    }

    // View: xem số dư của Bank
    function getBankBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // View: xem số dư nội bộ của 1 địa chỉ
    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
