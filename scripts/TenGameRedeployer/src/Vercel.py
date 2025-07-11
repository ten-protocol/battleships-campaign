import os
import requests
from loguru import logger
from typing import Literal
from dotenv import load_dotenv

from src.DiscordNotifier import Notifier

class VercelAPI:
    def __init__(self):
        load_dotenv(".env")
        self.vercel_uri = os.getenv('VERCEL_URI')
        self.vercel_jwt = os.getenv('VERCEL_JWT')

        self.headers = {
            'Authorization': f'Bearer {self.vercel_jwt}',
            'Content-Type': 'application/json'
        }

        # Load project-specific settings
        self.project_configs = {
            'battleships': {
                'project_name': os.getenv('BATTLESHIPS_VERCEL_PROJECT_NAME'),
                'env_name': os.getenv('BATTLESHIPS_VERCEL_ENV_NAME'),
                'deployment_url': os.getenv('BATTLESHIPS_VERCEL_DEPLOYMENT_URL')
            },
            'tenzen': {
                'project_name': os.getenv('TENZEN_VERCEL_PROJECT_NAME'),
                'env_name': os.getenv('TENZEN_VERCEL_ENV_NAME'),
                'deployment_url': os.getenv('TENZEN_VERCEL_DEPLOYMENT_URL')
            }
        }

    def _retrieve_env_id(self, project_name: str, env_name: str) -> str:
        response = requests.get(
            f'https://api.vercel.com/v9/projects/{project_name}/env?decrypt=true',
            headers=self.headers
        )
        for env in response.json().get('envs', []):
            if env['key'] == env_name and 'production' in env['target']:
                return env['id']
        raise ValueError(f"Environment variable {env_name} not found for project {project_name}.")

    def _retrieve_deployment_id(self, deployment_url: str) -> str:
        response = requests.get(
            f'https://api.vercel.com/v13/deployments/{deployment_url}',
            headers=self.headers
        )
        return response.json()['id']

    def update_env(self, project: Literal['battleships', 'tenzen'], address: str, zen_update: bool = False) -> bool:
        config = self.project_configs[project]

        # If it's a ZEN update, change env_name
        env_name = os.getenv(f'{project.upper()}_VERCEL_ZEN_ENV_NAME') if zen_update else config['env_name']

        env_id = self._retrieve_env_id(config['project_name'], env_name)
        url = f'https://api.vercel.com/v9/projects/{config["project_name"]}/env/{env_id}'

        json_data = {
            'comment': f'Current {project} {"ZEN" if zen_update else "deployed contract"}',
            'key': env_name,
            'target': ['production'],
            'type': 'encrypted',
            'value': address,
        }

        response = requests.patch(
            url,
            headers=self.headers,
            json=json_data,
        )

        if response.status_code == 200:
            logger.success(f'Updated {env_name} with {address}')
            Notifier().send_status(project, 'success', f'Updated {env_name} with {address}')
            return True
        else:
            logger.error(f'Error updating {env_name}: {response.json()}')
            Notifier().send_status(project, 'error', f'Error updating {env_name}: {response.json()}')
            return False

    def redeploy(self, project: Literal['battleships', 'tenzen']):
        config = self.project_configs[project]
        deployment_id = self._retrieve_deployment_id(config['deployment_url'])

        redeploy_url = "https://api.vercel.com/v13/deployments?forceNew=0&skipAutoDetectionConfirmation=0"
        
        json_data = {
            "name": config['project_name'],
            "deploymentId": deployment_id,
            'target': 'production',
            "withLatestCommit": True
        }

        response = requests.post(
            redeploy_url,
            headers=self.headers,
            json=json_data,
        )

        if response.status_code == 200:
            logger.success(f'Redeployed {config["project_name"]}.')
            Notifier().send_status(project, 'success', f'Redeployed {config["project_name"]}.')
            return response.json()
        else:
            logger.error(f'Error redeploying {config["project_name"]}')
            Notifier().send_status(project, 'error', f'Error redeploying {config["project_name"]}: {response.json()}')
            return False
