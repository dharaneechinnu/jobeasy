import requests
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Test connectivity to Remotive and Jobicy (free job APIs)'

    def handle(self, *args, **options):
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write('  JobEasy API Connection Test')
        self.stdout.write('=' * 50 + '\n')

        self._test_remotive()
        self._test_jobicy()

        self.stdout.write('\n' + '=' * 50 + '\n')

    def _test_remotive(self):
        self.stdout.write('\n[1] Remotive (https://remotive.com/api/remote-jobs)')
        try:
            resp = requests.get(
                'https://remotive.com/api/remote-jobs',
                params={'search': 'python developer', 'limit': 3},
                timeout=10,
            )
            resp.raise_for_status()
            jobs = resp.json().get('jobs', [])
            self.stdout.write(self.style.SUCCESS(f'   SUCCESS — {len(jobs)} jobs returned'))
            if jobs:
                self.stdout.write(f'   Sample: "{jobs[0].get("title")}" at {jobs[0].get("company_name")}')
        except requests.exceptions.Timeout:
            self.stdout.write(self.style.ERROR('   FAILED — Request timed out'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   FAILED — {e}'))

    def _test_jobicy(self):
        self.stdout.write('\n[2] Jobicy (https://jobicy.com/api/v2/remote-jobs)')
        try:
            resp = requests.get(
                'https://jobicy.com/api/v2/remote-jobs',
                params={'count': 3, 'tag': 'python'},
                timeout=10,
            )
            resp.raise_for_status()
            jobs = resp.json().get('jobs', [])
            self.stdout.write(self.style.SUCCESS(f'   SUCCESS — {len(jobs)} jobs returned'))
            if jobs:
                self.stdout.write(f'   Sample: "{jobs[0].get("jobTitle")}" at {jobs[0].get("companyName")}')
        except requests.exceptions.Timeout:
            self.stdout.write(self.style.ERROR('   FAILED — Request timed out'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   FAILED — {e}'))
