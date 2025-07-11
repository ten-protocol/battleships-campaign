import os
import time
import requests
from typing import Literal
from dotenv import load_dotenv

class Notifier:
    def __init__(self) -> None:
        load_dotenv(".env")
        self.battleships_webhook = os.getenv('BATTLESHIPS_WEBHOOK')
        self.tenzen_webhook = os.getenv('TENZEN_WEBHOOK')

        self.colors = {
            'success': 5620992,  # Green
            'status': 16766720,  # Gold
            'error': 16711680    # Red
        }

        # Map levels to webhooks (adjust as needed)
        self.wh_mapping = {
            'battleships': self.battleships_webhook,
            'tenzen': self.tenzen_webhook
        }

    def send_status(self, 
                    project: Literal['battleships', 'tenzen'], 
                    level: Literal['success', 'status', 'error'], 
                    status: str) -> None:

        embed = {
            'title': f'{level.capitalize()}',
            'description': status.capitalize(),
            'color': self.colors[level],
            'author': {"name": f"{project.capitalize()} Status"},
            'timestamp': time.strftime("%Y-%m-%dT%H:%M:%S+00:00")
        }

        data = {
            'embeds': [embed]
        }

        webhook_url = self.wh_mapping.get(project)

        if webhook_url:
            response = requests.post(webhook_url, json=data)
            if response.status_code != 204:
                print(f"Failed to send notification: {response.status_code}, {response.text}")
        else:
            print(f"Webhook URL for project '{project}' not found.")