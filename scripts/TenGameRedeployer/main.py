import time
from loguru import logger
from src.Redeployer import Redeployer

def main():
    battleships = Redeployer(game='battleships')
    tenzen = Redeployer(game='tenzen')

    while True:
        # Check Battleships
        try:
            battleships_over = battleships.get_game_status()
            logger.info(f"Battleships game ended: {battleships_over}")
            if battleships_over:
                logger.info("Redeploying Battleships...")
                battleships.deploy_game()
        except Exception as e:
            logger.error(f"Error checking/redeploying Battleships: {e}")

        # Check TenZen
        try:
            tenzen_over = tenzen.get_game_status()
            logger.info(f"TenZen game ended: {tenzen_over}")
            if tenzen_over:
                logger.info("Redeploying TenZen...")
                tenzen.deploy_game()
        except Exception as e:
            logger.error(f"Error checking/redeploying TenZen: {e}")

        time.sleep(60)

if __name__ == "__main__":
    main()
