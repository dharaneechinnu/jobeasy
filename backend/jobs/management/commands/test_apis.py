import json
import requests
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Test RapidAPI JSearch and Anthropic Claude API connections'

    def handle(self, *args, **options):
        self.stdout.write('\n' + '='*50)
        self.stdout.write('  JobEasy API Connection Test')
        self.stdout.write('='*50 + '\n')

        self._test_rapidapi()
        self._test_anthropic()

        self.stdout.write('\n' + '='*50 + '\n')

    def _test_rapidapi(self):
        self.stdout.write('\n[1] RapidAPI JSearch')

        key = settings.RAPIDAPI_KEY
        if not key:
            self.stdout.write(self.style.ERROR('   RAPIDAPI_KEY not set in .env'))
            return

        self.stdout.write(f'   Key found: {key[:8]}...')
        self.stdout.write('   Making test search: "Python developer fresher"...')

        try:
            response = requests.get(
                'https://jsearch.p.rapidapi.com/search',
                headers={
                    'X-RapidAPI-Key': key,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                },
                params={'query': 'Python developer fresher', 'num_pages': '1', 'page': '1'},
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()
            jobs = data.get('data', [])
            self.stdout.write(self.style.SUCCESS(f'   SUCCESS — {len(jobs)} jobs returned'))
            if jobs:
                self.stdout.write(f'   Sample: "{jobs[0].get("job_title")}" at {jobs[0].get("employer_name")}')
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                self.stdout.write(self.style.ERROR('   FAILED — Invalid API key (403 Forbidden)'))
            elif e.response.status_code == 429:
                self.stdout.write(self.style.WARNING('   RATE LIMITED — Key valid but quota exceeded'))
            else:
                self.stdout.write(self.style.ERROR(f'   FAILED — HTTP {e.response.status_code}'))
        except requests.exceptions.Timeout:
            self.stdout.write(self.style.ERROR('   FAILED — Request timed out'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   FAILED — {e}'))

    def _test_anthropic(self):
        self.stdout.write('\n[2] Anthropic Claude API')

        key = settings.ANTHROPIC_API_KEY
        if not key:
            self.stdout.write(self.style.ERROR('   ANTHROPIC_API_KEY not set in .env'))
            return

        self.stdout.write(f'   Key found: {key[:10]}...')
        self.stdout.write('   Sending test message to claude-sonnet-4-6...')

        try:
            import anthropic
            client = anthropic.Anthropic(api_key=key)
            msg = client.messages.create(
                model='claude-sonnet-4-6',
                max_tokens=64,
                messages=[{'role': 'user', 'content': 'Reply with just: OK'}],
            )
            reply = msg.content[0].text.strip()
            self.stdout.write(self.style.SUCCESS(f'   SUCCESS — Claude replied: "{reply}"'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   FAILED — {e}'))
