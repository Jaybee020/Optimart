import time
from uuid import uuid4

import requests


class ResendMail:
    def __init__(self, api_key: str):
        self.max_retries = 3
        self.api_key = api_key
        self.base_url = 'https://api.resend.com'

    def send_email(self, to: str, subject: str, content: str):
        headers = {
            'X-Entity-Ref-ID': str(uuid4()),
            'Authorization': f'Bearer {self.api_key}',
        }

        retries = 0
        while retries < self.max_retries:
            response = self._send_request(to, subject, content, headers)
            if response.status_code != 429:  # noqa: PLR2004
                return self._handle_response(response)

            # Rate limit exceeded
            retry_after = response.headers.get('retry-after', 10)
            time.sleep(int(retry_after))
            retries += 1

        raise RuntimeError(f'Max retry attempts ({self.max_retries}) reached.')

    def _send_request(self, to, subject, content, headers):
        payload = {
            'from': 'Optimart <onboarding@resend.dev>',
            'to': [to],
            'subject': subject,
            'text': content,
        }

        try:
            return requests.post(
                url=f'{self.base_url}/emails',
                json=payload,
                headers=headers,
                timeout=30,
            )
        except requests.exceptions.RequestException as e:
            raise ValueError(f'Error sending request: {e}') from e

    @staticmethod
    def _handle_response(response):
        response_data = response.json()
        if response.status_code == 200:  # noqa: PLR2004
            return response_data['id']

        error_message = response_data.get('message', 'Unknown error')
        raise ValueError(error_message)
