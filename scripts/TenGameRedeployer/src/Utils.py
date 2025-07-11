import json

class Utils:
    @staticmethod
    def get_battleship_game_source():
        with open('src/contracts/BattleshipGameTestnet.sol', 'r') as f:
            return f.read()
        
    @staticmethod
    def get_tenzen_game_source():
        with open('src/contracts/tenzen.sol', 'r') as f:
            return f.read()

    @staticmethod
    def get_zen_token_source():
        with open('src/contracts/zenToken.sol', 'r') as f:
            return f.read()
    
    @staticmethod
    def get_battleship_game_abi():
        with open('src/contracts/abis/BattleshipGameTestnetAbi.json', 'r') as f:
            return json.load(f)
        
    @staticmethod
    def get_tenzen_game_abi():
        with open('src/contracts/abis/tenzen.json', 'r') as f:
            return json.load(f)

    @staticmethod
    def get_erc20_token_abi():
        with open('src/contracts/abis/erc20.json', 'r') as f:
            return json.load(f)