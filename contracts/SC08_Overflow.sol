// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SC08_Overflow {
    mapping(address => uint256) public balances;

    // Hàm chuyển tiền lỗi (Giữ nguyên để hack tràn số)
    function transfer(address _to, uint256 _amount) public {
        unchecked {
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
        }
    }

    function getBalance(address _user) public view returns (uint256) {
        return balances[_user];
    }

    // --- MỚI: Hàm rút sạch tiền của Contract về ví Hacker ---
    function withdrawAll() public {
        // 1. Kiểm tra xem user có số dư trong sổ sách không (số dư ảo do hack)
        require(balances[msg.sender] > 0, "So du trong so sach = 0, khong duoc rut");

        // 2. Lấy số tiền thật đang nằm trong Contract
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "Contract dang khong co tien mat!");

        // 3. Chuyển hết tiền thật cho hacker
        payable(msg.sender).transfer(contractBalance);

        // 4. Reset số dư ảo về 0 (để kết thúc game)
        balances[msg.sender] = 0;
    }

    // --- MỚI: Hàm để Contract có thể nhận tiền nạp vào lúc Deploy ---
    receive() external payable {}
}