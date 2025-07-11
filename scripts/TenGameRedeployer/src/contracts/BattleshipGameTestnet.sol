// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BattleshipGameTestnet {
    uint256 constant HIT_REWARD = 1 * 10**18; // 1 ZEN token (18 decimals)
    uint256 constant SINK_REWARD = 3 * 10**18; // 3 ZEN tokens
    uint256 constant FINAL_SINK_REWARD = 20 * 10**18; // 20 ZEN tokens

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
    mapping(uint16 => uint8) private positionToShipIndex;
    uint256 private seed;
    uint256 private nonce = 0;
    uint8 private sunkShipsCount;
    bool public gameOver;
    uint8 public immutable gridSize;
    uint8 public immutable totalShips;
    uint256[] private cellStatesBitmap;
    mapping(address => uint16) private playerHits;
    mapping(address => uint16) private playerSinks;
    address private lastSunkShipPlayer;
    uint256 private totalHits;
    uint256 public totalZENAllocated;

    IERC20 public rewardToken;

    event GameOver(address winner, uint256 totalZENAllocated);
    event HitFeedback(
        address indexed user,
        uint8 x,
        uint8 y,
        bool success,
        bool sunk,
        uint8 sunkShipsCount,
        uint256 totalZENAllocated,
        uint256 zenTransferred,
        uint256[] gameState,
        bool uniqueStrike
    );

    constructor(address tokenAddress, uint8 _gridSize, uint8 _totalShips) {
        rewardToken = IERC20(tokenAddress);
        gridSize = _gridSize;
        totalShips = _totalShips;
        seed = uint256(
            keccak256(
                abi.encodePacked(block.difficulty, block.timestamp, msg.sender)
            )
        );
        uint256 bitmapSize = ((uint256(gridSize) * uint256(gridSize) * 2) + 255) / 256;
        cellStatesBitmap = new uint256[](bitmapSize);
        generatePositions();
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

    function hit(uint8 x, uint8 y) public payable {
        require(!gameOver, "Game is over");
        require(msg.value == 0.00443 ether, "Incorrect fee");
        uint16 cellIndex = uint16(y) * uint16(gridSize) + uint16(x);
        require(cellIndex < uint16(gridSize) * uint16(gridSize), "Invalid coordinates");

        uint8 cellState = getCellState(cellIndex);

        if (cellState != 0) {
            payable(msg.sender).transfer(msg.value);
            emit HitFeedback(
                msg.sender,
                x,
                y,
                false,
                false,
                sunkShipsCount,
                totalZENAllocated,
                0,
                cellStatesBitmap,
                false
            );
            return;
        }

        _processHit(msg.sender, x, y, cellIndex);
    }

    function _processHit(address player, uint8 x, uint8 y, uint16 cellIndex) private {
        bool success;
        bool sunk;
        uint256 zenTransferred = 0;

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
                    zenTransferred = FINAL_SINK_REWARD;
                    emit GameOver(lastSunkShipPlayer, totalZENAllocated);
                } else {
                    zenTransferred = SINK_REWARD;
                }
            } else {
                zenTransferred = HIT_REWARD;
            }
        } else {
            success = false;
            setCellState(cellIndex, 1);
        }

        if (zenTransferred > 0) {
            rewardToken.transfer(player, zenTransferred);
            totalZENAllocated += zenTransferred;
        }

        emit HitFeedback(
            player,
            x,
            y,
            success,
            sunk,
            sunkShipsCount,
            totalZENAllocated,
            zenTransferred,
            cellStatesBitmap,
            true
        );
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

    function getZenTokenBalance() public view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function gameInfo() public view returns (bool, uint8, uint8) {
        return (gameOver, gridSize, totalShips);
    }
}