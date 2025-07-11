import os
import time
from web3 import Web3
from loguru import logger
from typing import Literal
from dotenv import load_dotenv, set_key
from solcx import compile_source, install_solc

from src.Utils import Utils
from src.Faucet import Faucet
from src.Vercel import VercelAPI
from src.DiscordNotifier import Notifier

install_solc('0.8.24')

class Redeployer:
    def __init__(self, game: Literal['battleships', 'tenzen']):
        load_dotenv(".env")

        self.game = game
        self.rpc = os.getenv('TEN_RPC')
        self.token = os.getenv('DEPLOYER_TOKEN')
        self.deployer_key = os.getenv('DEPLOYER_PK')
        
        self.w3 = Web3(Web3.HTTPProvider(f'{self.rpc}{self.token}'))
        self.deployer_address = self.w3.to_checksum_address(self.w3.eth.account.from_key(self.deployer_key).address)
        
        self.faucet_manager = Faucet()
        self.vercelApi = VercelAPI()

        self.zen_address = os.getenv('ZEN_ADDRESS')
        if self.zen_address:
            self.zen_address = self.w3.to_checksum_address(self.zen_address)
        
        if self.game == 'battleships':
            self.battleships_address = os.getenv('BATTLESHIPS_ADDRESS')
            self.grid_size = int(os.getenv('BATTLESHIPS_GRID_SIZE'))
            self.total_ships = int(os.getenv('BATTLESHIPS_TOTAL_SHIPS'))
            if self.battleships_address:
                self.battleships_address = self.w3.to_checksum_address(self.battleships_address)
        else:
            self.tenzen_address = os.getenv('TENZEN_ADDRESS')
            self.tenzen_max_number = int(os.getenv('TENZEN_MAX_NUMBER'))
            if self.tenzen_address:
                self.tenzen_address = self.w3.to_checksum_address(self.tenzen_address)

        if not self.zen_address:
            self.zen_address = self.deploy_zen()
            self.update_env('ZEN_ADDRESS', self.zen_address)
            self.update_env('BATTLESHIPS_ADDRESS', '')
            self.battleships_address = None
            self.update_env('TENZEN_ADDRESS')
            self.tenzen_address = None

        if self.game == 'battleships' and not self.battleships_address:
            self.deploy_game()
        if self.game == 'tenzen' and not self.tenzen_address:
            self.deploy_game()

    def update_env(self, env_name: str, env_value: str):
        set_key('.env', env_name, env_value)

    def _request_funding(self):
        balance = self.w3.from_wei(self.w3.eth.get_balance(self.deployer_address), 'ether')
        if balance < 0.5:
            logger.info(f"Deployer balance: {balance}. Requesting funds...")
            if self.faucet_manager.request(self.deployer_address):
                return True
            time.sleep(120)
            return self._request_funding()
        return True

    def deploy_zen(self) -> str:
        self._request_funding()

        compiled_sol = compile_source(Utils.get_zen_token_source(), solc_version='0.8.24')
        contract_interface = compiled_sol['<stdin>:ZENToken']

        if not self.w3.is_connected():
            logger.error("Failed to connect to TEN network")
            exit()

        zen_token = self.w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])
        transaction = zen_token.constructor().build_transaction({
            'chainId': self.w3.eth.chain_id,
            'gas': zen_token.constructor().estimate_gas({'from': self.deployer_address}),
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.deployer_address),
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key=self.deployer_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        logger.success(f"ZEN Token deployed at {tx_receipt.contractAddress}")
        Notifier().send_status(self.game, 'success', f"ZEN Token deployed at {tx_receipt.contractAddress}")

        self.vercelApi.update_env('battleships', tx_receipt.contractAddress, zen_update=True)
        self.vercelApi.update_env('tenzen', tx_receipt.contractAddress, zen_update=True)

        return tx_receipt.contractAddress

    def deploy_game(self):
        self._request_funding()

        if self.game == 'battleships':
            compiled_sol = compile_source(Utils.get_battleship_game_source(), solc_version='0.8.24')
            contract_interface = compiled_sol['<stdin>:BattleshipGameTestnet']
            constructor_args = (self.zen_address, self.grid_size, self.total_ships)
            env_name = 'BATTLESHIPS_ADDRESS'
        else:
            compiled_sol = compile_source(Utils.get_tenzen_game_source(), solc_version='0.8.24')
            contract_interface = compiled_sol['<stdin>:TenZen']
            constructor_args = (self.zen_address, self.tenzen_max_number)
            env_name = 'TENZEN_ADDRESS'

        if not self.w3.is_connected():
            Notifier().send_status(self.game, level='status', status='Failed to connect to TEN.')
            return

        contract = self.w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])
        transaction = contract.constructor(*constructor_args).build_transaction({
            'chainId': self.w3.eth.chain_id,
            'gas': contract.constructor(*constructor_args).estimate_gas({'from': self.deployer_address}),
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.deployer_address),
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key=self.deployer_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        address = tx_receipt.contractAddress

        self.update_env(env_name, address)

        logger.success(f"{self.game.capitalize()} contract deployed at {address}")
        Notifier().send_status(self.game, 'success', f"{self.game.capitalize()} contract deployed at {address}")

        self.prefund_game(address)

        self.vercelApi.update_env(self.game, address)
        self.vercelApi.redeploy(self.game)

        if self.game == 'battleships':
            self.battleships_address = address
        else:
            self.tenzen_address = address

    def get_game_status(self) -> bool:
        try:
            if self.game == 'battleships':
                contract = self.w3.eth.contract(address=self.battleships_address, abi=Utils.get_battleship_game_abi())
                return contract.functions.gameOver().call()
            else:
                contract = self.w3.eth.contract(address=self.tenzen_address, abi=Utils.get_tenzen_game_abi())
                return not contract.functions.isGameActive().call()
        except Exception as e:
            Notifier().send_status(self.game, 'error', f'Failed to get game status: {e}. Retrying in 10 minutes.')
            time.sleep(600)
            return self.get_game_status()

    def _calculate_zen_prefund(self) -> int:
        if self.game == 'battleships':
            return ((5-1)*1)*self.total_ships + ((self.total_ships-1)*3) + 20
        else:
            total_zen = 0
            for number in range(1, self.tenzen_max_number + 1):
                zero_count = len(str(number)) - len(str(number).rstrip('0'))
                total_zen += [0, 1, 3.5, 20, 75][zero_count] if zero_count <= 4 else 0
            return int(total_zen)

    def prefund_game(self, address: str):
        contract = self.w3.eth.contract(address=self.zen_address, abi=Utils.get_erc20_token_abi())
        prefund_amnt = self._calculate_zen_prefund()
        tx = contract.functions.mint(address, prefund_amnt * 10**18).build_transaction({
            'from': self.deployer_address,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.deployer_address),
        })

        signed_txn = self.w3.eth.account.sign_transaction(tx, private_key=self.deployer_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        if tx_receipt['status'] == 1:
            logger.success(f"Prefunded {address} with {prefund_amnt} ZEN")
            Notifier().send_status(self.game, 'success', f"Prefunded {address} with {prefund_amnt} ZEN")
        else:
            logger.error(f"Failed to prefund {address} with {prefund_amnt} ZEN")
            Notifier().send_status(self.game, 'error', f"Failed to prefund {address} with {prefund_amnt} ZEN")
