// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
        bool[] hits;
    }

    Ship[] private ships;
    mapping(uint16 => uint8) private positionToShipIndex;
    mapping(uint16 => bool) private hits;
    mapping(uint16 => bool) private misses;
    uint256 private seed;
    uint256 private nonce = 0;
    uint8 private sunkShipsCount;
    bool public gameOver;
    uint8 public gridSize;
    uint8 public totalShips; // Adjusted total ships
    uint16[] private allHits;
    uint16[] private allMisses;

    mapping(address => uint16) private playerHits;
    mapping(address => uint16) private playerSinks;
    address private lastSunkShipPlayer;
    uint256 private totalHits;
    uint256 public totalZENAllocated; // Track total ZEN tokens allocated

    IERC20 public rewardToken;

    event GameOver(address winner, uint256 totalZENAllocated);
    event HitFeedback(
        address indexed user,
        uint8[2] guessedCoords,
        bool success,
        bool sunk,
        uint16[] allHits,
        uint16[] allMisses,
        uint8 sunkShipsCount,
        uint256 totalZENAllocated,
        uint256 zenTransferred,
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
                        hits: new bool[](length)
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

    function isPositionUniqueAndFits(
        uint8 x,
        uint8 y,
        uint8 length,
        bool isHorizontal
    ) private view returns (bool) {
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
        require(!gameOver, "Game is over, no more hits accepted");
        require(msg.value == 0.00443 ether, "Incorrect fee amount");
        uint16 positionKey = packCoordinates(x, y);

        if (hits[positionKey]) {
            payable(msg.sender).transfer(msg.value);
            emit HitFeedback(
                msg.sender,
                [x, y],
                false,
                false,
                allHits,
                allMisses,
                sunkShipsCount,
                totalZENAllocated,
                0,
                false
            );
        } else {
            _processHit(msg.sender, x, y);
        }
    }

    function _processHit(address player, uint8 x, uint8 y) private {
        uint16 positionKey = packCoordinates(x, y);
        bool success;
        bool sunk;
        uint256 zenTransferred = 0;

        hits[positionKey] = true;
        totalHits++;
        playerHits[player]++;

        uint8 shipIndex = positionToShipIndex[positionKey];
        if (shipIndex != 0) {
            shipIndex--; // Adjust for index starting at 0
            success = true;
            Ship storage ship = ships[shipIndex];
            uint8 hitIndex = ship.isHorizontal ? (x - ship.start.x) : (y - ship.start.y);

            ship.hits[hitIndex] = true; // Record the hit
            allHits.push(positionKey);

            // Check if the ship is sunk
            bool allHit = true;
            for (uint8 i = 0; i < ship.length; i++) {
                if (!ship.hits[i]) {
                    allHit = false;
                    break;
                }
            }

            if (allHit) {
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
            misses[positionKey] = true;
            allMisses.push(positionKey);
        }

        if (zenTransferred > 0) {
            require(
                rewardToken.transfer(player, zenTransferred),
                "Token transfer failed"
            );
            totalZENAllocated += zenTransferred;
        }

        emit HitFeedback(
            player,
            [x, y],
            success,
            sunk,
            allHits,
            allMisses,
            sunkShipsCount,
            totalZENAllocated,
            zenTransferred,
            true
        );
    }

    function getPersonalStats()
    public
    view
    returns (uint16 personalHits, uint16 personalSinks)
    {
        personalHits = playerHits[msg.sender];
        personalSinks = playerSinks[msg.sender];
        return (personalHits, personalSinks);
    }

    function getZenTokenBalance() public view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function gameInfo() public returns(bool, uint8, uint8) {
        return (gameOver, gridSize, totalShips);
    }
}