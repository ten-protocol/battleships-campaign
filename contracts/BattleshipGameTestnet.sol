// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// TEN callbacks interface - prevents txn analysis attack or proxy exploits
interface TenCallbacks {
    function register(bytes calldata) external payable returns (uint256);
}

contract BattleshipGameTestnet {
    uint256 constant MOVE_FEE = 0.000443 ether;
    address public owner;

    // Dynamic rewards calculated from game parameters
    uint256 public hitReward;
    uint256 public sinkReward;
    uint256 public finalSinkReward;
    uint256 public totalShipCells;

    struct Position {
        uint8 x;
        uint8 y;
    }

    struct Ship {
        Position start;
        uint8 length;
        bool isHorizontal;
        uint256 hitsBitmap;
    }

    Ship[] public ships;
    mapping(uint16 position => uint8 shipIndex) private positionToShipIndex;
    uint256 private seed;
    uint256 private nonce = 0;
    uint8 private sunkShipsCount;
    bool public gameOver;
    uint8 public immutable gridSize;
    uint8 public immutable totalShips;
    uint256[] private cellStatesBitmap;
    mapping(address player => uint16 hits) private playerHits;
    mapping(address player => uint16 sinks) private playerSinks;
    address private lastSunkShipPlayer;
    uint256 private totalHits;
    uint256 public totalETHAwarded;
    mapping(uint256 callbackId => address player) private callbackToPlayer;
    mapping(address player => uint256 refundAmount) private playerToRefundAmount;

    TenCallbacks private tenCallbacks;

    event GameOver(address winner, uint256 totalETHAwarded);
    event HitFeedback(
        address indexed user,
        uint8 x,
        uint8 y,
        bool success,
        bool sunk,
        uint8 sunkShipsCount,
        uint256 totalETHAwarded,
        uint256 ethAwarded,
        uint256[] gameState,
        bool uniqueStrike
    );

    modifier onlyTenSystemCall() {
        require(msg.sender == address(tenCallbacks), "Only TEN system can call");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor(address tenCallbacksAddress, uint8 _gridSize, uint8 _totalShips) {
        owner = msg.sender;
        tenCallbacks = TenCallbacks(tenCallbacksAddress);
        gridSize = _gridSize;
        totalShips = _totalShips;
        seed = uint256(
            keccak256(
                abi.encodePacked(block.prevrandao, block.timestamp, msg.sender)
            )
        );
        uint256 bitmapSize = ((uint256(gridSize) * uint256(gridSize) * 2) + 255) / 256;
        cellStatesBitmap = new uint256[](bitmapSize);
        generatePositions();
        calculateRewards();
    }

    function generatePositions() private {
        while (ships.length < totalShips) {
            uint256 hash = uint256(keccak256(abi.encodePacked(seed, nonce)));
            for (uint8 i = 0; i < 36 && ships.length < totalShips; i++) {
                uint8 x = uint8(hash & 0xFF) % gridSize;
                hash >>= 8;
                uint8 y = uint8(hash & 0xFF) % gridSize;
                hash >>= 8;
                uint8 length = (uint8(hash & 0x03)) + 2;
                hash >>= 2;
                bool isHorizontal = (hash & 0x01) == 1;
                hash >>= 1;

                if (isPositionUniqueAndFits(x, y, length, isHorizontal)) {
                    ships.push(Ship({
                        start: Position(x, y),
                        length: length,
                        isHorizontal: isHorizontal,
                        hitsBitmap: 0
                    }));
                    totalShipCells += length;
                    uint8 index = uint8(ships.length - 1);
                    for (uint8 j = 0; j < length; j++) {
                        uint8 posX = x + (isHorizontal ? j : 0);
                        uint8 posY = y + (isHorizontal ? 0 : j);
                        uint16 positionKey = packCoordinates(posX, posY);
                        positionToShipIndex[positionKey] = index + 1;
                    }
                }
                if (hash < 0xFF) {
                    nonce++;
                    hash = uint256(keccak256(abi.encodePacked(seed, nonce)));
                }
            }
            nonce++;
        }
    }

    function calculateRewards() private {
        // Expected plays = 50% of grid (worst case assumption for house edge)
        uint256 expectedPlays = (uint256(gridSize) * uint256(gridSize)) / 2;

        // Prize pool = 80% of expected fees (20% house edge)
        uint256 prizePool = (expectedPlays * MOVE_FEE * 80) / 100;

        // Hit reward = 60% of pool distributed across all ship cells
        hitReward = (prizePool * 60) / (100 * totalShipCells);

        // Sink reward = 25% of pool distributed across all ships
        sinkReward = (prizePool * 25) / (100 * uint256(totalShips));

        // Final sink reward = 15% of pool
        finalSinkReward = (prizePool * 15) / 100;
    }

    function isPositionUniqueAndFits(uint8 x, uint8 y, uint8 length, bool isHorizontal) private view returns (bool) {
        if (isHorizontal) {
            if (x + length > gridSize) return false;
        } else {
            if (y + length > gridSize) return false;
        }
        for (uint8 j = 0; j < length; j++) {
            uint8 posX = x + (isHorizontal ? j : 0);
            uint8 posY = y + (isHorizontal ? 0 : j);
            uint16 positionKey = packCoordinates(posX, posY);
            if (positionToShipIndex[positionKey] != 0) {
                return false;
            }
        }
        return true;
    }

    function packCoordinates(uint8 x, uint8 y) private pure returns (uint16) {
        return (uint16(x) << 8) | uint16(y);
    }

    // Modified hit function that registers a callback for execution at end of block
    function hit(uint8 x, uint8 y) public payable {
        require(!gameOver, "Game is over");

        uint16 cellIndex = uint16(y) * uint16(gridSize) + uint16(x);
        require(cellIndex < uint16(gridSize) * uint16(gridSize), "Invalid coordinates");

        uint8 cellState = getCellState(cellIndex);
        if (cellState != 0) {
            (bool success, ) = payable(msg.sender).call{value: msg.value}("");
            require(success, "Transfer failed");
            emit HitFeedback(
                msg.sender,
                x,
                y,
                false,
                false,
                sunkShipsCount,
                totalETHAwarded,
                0,
                cellStatesBitmap,
                false
            );
            return;
        }

        // Calculate total required payment: game fee + gas fee
        uint256 etherGasForHitProcessing = 400_000 * block.basefee;
        uint256 totalRequired = MOVE_FEE + etherGasForHitProcessing;
        require(msg.value >= totalRequired, "Insufficient payment for game fee and gas");

        // Encode the function to be called by the TEN system contract
        bytes memory callbackTargetInfo = abi.encodeWithSelector(
            this.processHitCallback.selector,
            msg.sender,
            x,
            y,
            cellIndex,
            msg.value - totalRequired
        );

        // Register the callback with the TEN system
        uint256 callbackId = tenCallbacks.register{value: etherGasForHitProcessing}(callbackTargetInfo);
        callbackToPlayer[callbackId] = msg.sender;
    }

    // This function will be called by the TEN system at the end of the block
    function processHitCallback(address player, uint8 x, uint8 y, uint16 cellIndex, uint256 refund) external onlyTenSystemCall {
        bool success;
        bool sunk;
        uint256 ethAwarded = 0;

        totalHits++;
        playerHits[player]++;

        uint16 positionKey = packCoordinates(x, y);
        uint8 shipIndex = positionToShipIndex[positionKey];
        if (shipIndex != 0) {
            shipIndex--;
            success = true;
            Ship storage ship = ships[shipIndex];
            uint8 hitIndex = ship.isHorizontal ? (x - ship.start.x) : (y - ship.start.y);

            ship.hitsBitmap |= uint256(1) << hitIndex;

            setCellState(cellIndex, 2);

            if (ship.hitsBitmap == (uint256(1) << ship.length) - 1) {
                sunk = true;
                sunkShipsCount++;
                playerSinks[player]++;
                if (sunkShipsCount == totalShips) {
                    gameOver = true;
                    lastSunkShipPlayer = player;
                    ethAwarded = finalSinkReward;
                    emit GameOver(lastSunkShipPlayer, totalETHAwarded);
                } else {
                    ethAwarded = sinkReward;
                }
            } else {
                ethAwarded = hitReward;
            }
        } else {
            success = false;
            setCellState(cellIndex, 1);
        }

        if (ethAwarded > 0) {
            (bool rewardSuccess, ) = payable(player).call{value: ethAwarded}("");
            require(rewardSuccess, "Reward transfer failed");
            totalETHAwarded += ethAwarded;
        }

        emit HitFeedback(
            player,
            x,
            y,
            success,
            sunk,
            sunkShipsCount,
            totalETHAwarded,
            ethAwarded,
            cellStatesBitmap,
            true
        );

        // Return any excess payment to the player
        if (refund > 0) {
            (bool refundSuccess, ) = payable(player).call{value: refund}("");
            require(refundSuccess, "Transfer failed");
        }
    }

    function handleRefund(uint256 callbackId) external payable {
        address player = callbackToPlayer[callbackId];
        playerToRefundAmount[player] += msg.value;
    }

    function claimRefund() external {
        uint256 refundAmount = playerToRefundAmount[msg.sender];
        require(refundAmount > 0, "No refunds to claim");
        playerToRefundAmount[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Transfer failed");
    }

    function getCellState(uint16 cellIndex) private view returns (uint8) {
        uint256 wordIndex = cellIndex / 128;
        uint256 bitIndex = (cellIndex % 128) * 2;

        if (bitIndex <= 254) {
            uint256 value = (cellStatesBitmap[wordIndex] >> bitIndex) & 0x03;
            return uint8(value);
        } else {
            uint256 lowerBits = 256 - bitIndex;
            uint256 upperBits = 2 - lowerBits;

            uint256 lowerPart = (cellStatesBitmap[wordIndex] >> bitIndex) & ((1 << lowerBits) - 1);
            uint256 upperPart = (cellStatesBitmap[wordIndex + 1]) & ((1 << upperBits) - 1);

            uint256 value = (upperPart << lowerBits) | lowerPart;
            return uint8(value);
        }
    }

    function setCellState(uint16 cellIndex, uint8 state) private {
        uint256 wordIndex = cellIndex / 128;
        uint256 bitIndex = (cellIndex % 128) * 2;

        if (bitIndex <= 254) {
            uint256 mask = uint256(0x03) << bitIndex;
            cellStatesBitmap[wordIndex] = (cellStatesBitmap[wordIndex] & ~mask) | (uint256(state) << bitIndex);
        } else {
            uint256 lowerBits = 256 - bitIndex;
            uint256 upperBits = 2 - lowerBits;

            uint256 lowerMask = ((1 << lowerBits) - 1) << bitIndex;
            uint256 upperMask = (1 << upperBits) - 1;

            cellStatesBitmap[wordIndex] = (cellStatesBitmap[wordIndex] & ~lowerMask) | ((state & ((1 << lowerBits) - 1)) << bitIndex);
            cellStatesBitmap[wordIndex + 1] = (cellStatesBitmap[wordIndex + 1] & ~upperMask) | (state >> lowerBits);
        }
    }

    function getPersonalStats() public view returns (uint16 personalHits, uint16 personalSinks) {
        personalHits = playerHits[msg.sender];
        personalSinks = playerSinks[msg.sender];
    }

    function getEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(uint256 amount) external onlyOwner {
        uint256 balance = address(this).balance;
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "Insufficient balance");
        (bool success, ) = payable(owner).call{value: withdrawAmount}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}

    function gameInfo() public view returns (bool, uint8, uint8) {
        return (gameOver, gridSize, totalShips);
    }
}
