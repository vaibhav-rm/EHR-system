// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicineEscrow {
    address public admin;

    struct OrderDeposit {
        address patient;
        uint256 amount;
        bool active;
        uint256 timestamp;
    }

    // Mapping from Order ID => Deposit Details
    mapping(uint256 => OrderDeposit) public deposits;

    event DepositReceived(uint256 indexed orderId, address indexed patient, uint256 amount);
    event RefundIssued(uint256 indexed orderId, address indexed patient, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Patient deposits ETH for a specific order
    function deposit(uint256 orderId) external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(!deposits[orderId].active, "Order ID already has an active deposit");

        deposits[orderId] = OrderDeposit({
            patient: msg.sender,
            amount: msg.value,
            active: true,
            timestamp: block.timestamp
        });

        emit DepositReceived(orderId, msg.sender, msg.value);
    }

    // Admin (or system) triggers refund upon successful delivery payment
    function refund(uint256 orderId) external {
        OrderDeposit storage depositData = deposits[orderId];
        
        require(depositData.active, "No active deposit for this order");
        // For simplicity, allowed refunders: 
        // 1. Admin (System automation)
        // 2. The patient themselves (if we want to allow cancellation - simplified here to admin/system mostly, 
        //    but let's allow patient to withdraw if it's been a long time? keeping it simple for now: Admin)
        require(msg.sender == admin, "Only admin can process refunds"); 

        uint256 amount = depositData.amount;
        address payable recipient = payable(depositData.patient);

        depositData.active = false;
        depositData.amount = 0;

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit RefundIssued(orderId, recipient, amount);
    }

    function getDeposit(uint256 orderId) external view returns (address patient, uint256 amount, bool active) {
        OrderDeposit memory d = deposits[orderId];
        return (d.patient, d.amount, d.active);
    }
}
