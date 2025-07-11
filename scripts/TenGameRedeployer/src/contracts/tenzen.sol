// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TenZen {
    uint256 private counter;
    uint256 private maxCount = 10000000;
    mapping(address => uint256) private zenBalance;
    mapping(address => uint256[]) private userPlays;
    mapping(address => uint256) private userPrize;
    IERC20 public rewardToken;
    address private owner;
    
    event Played(address indexed player, uint256 playNumber, uint256 prize);
    event PrizeClaimed(address indexed player, uint256 amount);
    event ZenTokenClaimed(address indexed player, uint256 amount);


    constructor(address tokenAddress, uint256 maxNumber) {
        rewardToken = IERC20(tokenAddress);
        owner = msg.sender;
        maxCount = maxNumber;
        counter = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier gameActive() {
        require(counter < maxCount, "Game has ended");
        _;
    }

    modifier hasZenTokens(address _player) {
        require(zenBalance[_player] >= 1, "Not enough Zen tokens");
        _;
    }

    function play() public payable gameActive {
        require(msg.value == 0.00443 ether, 'Incorrect fee amount');

        counter++;
        userPlays[msg.sender].push(counter);
        
        uint256 prize = calculatePrize(counter);
        userPrize[msg.sender] += prize;

        if (prize > 0) {
            require(rewardToken.transfer(msg.sender, prize), "Token transfer failed");
        }
        
        emit Played(msg.sender, counter, prize);
    }

    function calculatePrize(uint256 _counter) private pure returns (uint256) {
        if (_counter % 10000000 == 0) return 10000 * 10**18;
        if (_counter % 1000000 == 0) return 1300 * 10**18;
        if (_counter % 100000 == 0) return 50 * 10**18;
        if (_counter % 10000 == 0) return 75 * 10**18;
        if (_counter % 1000 == 0) return 20 * 10**18;
        if (_counter % 100 == 0) return 3.5 * 10**18;
        if (_counter % 10 == 0) return 1 * 10**18;
        return 0;
    }
    
    function claimPrize() external {
        uint256 prize = userPrize[msg.sender];
        require(prize > 0, "No prizes to claim");

        userPrize[msg.sender] = 0;
        emit PrizeClaimed(msg.sender, prize);
    }

    function getPlayHistory() external view returns (uint256[] memory) {
        return userPlays[msg.sender];
    }

    function getZenBalance() external view returns (uint256) {
        return zenBalance[msg.sender];
    }

    function claimZenTokens(uint256 _amount) external {
        zenBalance[msg.sender] += _amount;
        emit ZenTokenClaimed(msg.sender, _amount);
    }

    function isGameActive() external view returns (bool) {
        return (counter < maxCount);
    }

    function getMaxCount() external view returns (uint256){
        return maxCount;
    }

    function getUserPrizePool() external view returns (uint256) {
        return userPrize[msg.sender];
    }

    function endGame() external onlyOwner {
        counter = maxCount;
    }
}