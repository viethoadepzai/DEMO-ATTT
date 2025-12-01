// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";

// HỢP ĐỒNG NẠN NHÂN
// Một phiên đấu giá đơn giản có lỗ hổng reentrancy.
contract Auction {
    address public highestBidder;
    uint public highestBid;
    
    // Lưu số tiền hoàn lại cho những người đã bị "vượt mặt"
    mapping(address => uint) public refunds;
    
    // Hàm này là public để nhận tiền (ví dụ: người chủ nạp tiền vào)
    receive() external payable {}

    function bid() public payable {
        require(msg.value > highestBid, "Your bid is too low");

        // Nếu có người trả giá cao nhất trước đó,
        // ghi lại số tiền để hoàn trả cho họ.
        if (highestBidder != address(0)) {
            refunds[highestBidder] += highestBid;
        }

        // Cập nhật người trả giá cao nhất mới
        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    // Hàm rút tiền (hoàn tiền) chứa lỗ hổng
    function withdrawRefund() public {
        uint amount = refunds[msg.sender];
        require(amount > 0, "No refund available");

        // !!! LỖ HỔNG !!!
        // Gửi tiền (tương tác) TRƯỚC KHI cập nhật số dư.
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw");
        
        // Dòng này sẽ chỉ được gọi sau khi cuộc tấn công kết thúc
        refunds[msg.sender] = 0;
    }

    // Hàm tiện ích để xem số dư của hợp đồng
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}