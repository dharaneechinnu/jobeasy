import hashlib
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

REMOTIVE_URL = 'https://remotive.com/api/remote-jobs'
JOBICY_URL = 'https://jobicy.com/api/v2/remote-jobs'

EXPERIENCE_KEYWORDS = {
    'fresher': 'entry level fresher',
    'junior':  'junior',
    'mid':     'mid level',
    'senior':  'senior',
}


def _make_id(source, raw_id):
    return hashlib.md5(f"{source}:{raw_id}".encode()).hexdigest()[:16]


def _fetch_remotive(query, limit=15):
    try:
        resp = requests.get(
            REMOTIVE_URL,
            params={'search': query, 'limit': limit},
            timeout=10,
        )
        resp.raise_for_status()
        jobs = []
        for job in resp.json().get('jobs', []):
            jobs.append({
                'job_id':             _make_id('remotive', job.get('id', '')),
                'job_title':          job.get('title', ''),
                'employer_name':      job.get('company_name', ''),
                'employer_logo':      job.get('company_logo'),
                'job_employment_type': job.get('job_type', '').replace('_', ' ').title(),
                'job_apply_link':     job.get('url', ''),
                'job_description':    (job.get('description') or '')[:500],
                'job_city':           None,
                'job_country':        job.get('candidate_required_location', ''),
                'job_posted_at':      job.get('publication_date'),
                'job_min_salary':     None,
                'job_max_salary':     None,
                'job_salary_currency': None,
                'job_highlights':     {},
                'source_portal':      'Remotive',
            })
        return jobs
    except requests.exceptions.RequestException:
        return []


def _fetch_jobicy(query, limit=15):
    try:
        resp = requests.get(
            JOBICY_URL,
            params={'count': limit, 'tag': query},
            timeout=10,
        )
        resp.raise_for_status()
        jobs = []
        for job in resp.json().get('jobs', []):
            jobs.append({
                'job_id':             _make_id('jobicy', job.get('id', '')),
                'job_title':          job.get('jobTitle', ''),
                'employer_name':      job.get('companyName', ''),
                'employer_logo':      job.get('companyLogo'),
                'job_employment_type': job.get('jobType', ''),
                'job_apply_link':     job.get('url', ''),
                'job_description':    (job.get('jobDescription') or '')[:500],
                'job_city':           None,
                'job_country':        job.get('jobGeo', ''),
                'job_posted_at':      job.get('pubDate'),
                'job_min_salary':     None,
                'job_max_salary':     None,
                'job_salary_currency': None,
                'job_highlights':     {},
                'source_portal':      'Jobicy',
            })
        return jobs
    except requests.exceptions.RequestException:
        return []


def fetch_jobs(query, location='', employment_type='', date_posted='month',
               experience='', page=1, num_pages=1):
    """Aggregate jobs from Remotive and Jobicy — free, no API key required."""
    experience_kw = EXPERIENCE_KEYWORDS.get(experience, '')
    search_query = ' '.join(filter(None, [query, experience_kw]))

    all_jobs = _fetch_remotive(search_query) + _fetch_jobicy(query)

    # Filter by location when provided
    if location:
        loc_lower = location.lower()
        filtered = [
            j for j in all_jobs
            if loc_lower in (j.get('job_country') or '').lower()
            or loc_lower in (j.get('job_city') or '').lower()
        ]
        if filtered:
            all_jobs = filtered

    # Filter by employment type when provided
    if employment_type:
        et_lower = employment_type.lower()
        filtered = [
            j for j in all_jobs
            if et_lower in (j.get('job_employment_type') or '').lower()
        ]
        if filtered:
            all_jobs = filtered

    # Deduplicate
    seen = set()
    unique = []
    for job in all_jobs:
        jid = job.get('job_id')
        if jid and jid not in seen:
            seen.add(jid)
            unique.append(job)

    # Paginate
    page_size = 10
    start = (page - 1) * page_size
    return unique[start:start + page_size], True


def format_job(job):
    """Jobs from fetch_jobs are already in the normalised format."""
    return job


class JobSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query', '').strip()
        if not query:
            return Response(
                {'error': 'query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        location        = request.query_params.get('location', '').strip()
        employment_type = request.query_params.get('employment_type', '').strip()
        date_posted     = request.query_params.get('date_posted', 'month')
        experience      = request.query_params.get('experience', 'fresher').strip()
        page            = int(request.query_params.get('page', 1))

        try:
            jobs, _ = fetch_jobs(query, location, employment_type, date_posted, experience, page)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch jobs: {e}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({
            'count':         len(jobs),
            'page':          page,
            'has_next_page': len(jobs) >= 10,
            'results':       jobs,
        })


class JobFiltersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'employment_types': [
                {'value': 'fulltime',    'label': 'Full Time'},
                {'value': 'parttime',    'label': 'Part Time'},
                {'value': 'intern',      'label': 'Internship'},
                {'value': 'contractor',  'label': 'Contract'},
            ],
            'date_posted_options': [
                {'value': 'today', 'label': 'Today'},
                {'value': 'week',  'label': 'This Week'},
                {'value': 'month', 'label': 'This Month'},
                {'value': 'all',   'label': 'All Time'},
            ],
            'experience_levels': [
                {'value': 'fresher', 'label': 'Fresher'},
                {'value': 'junior',  'label': 'Junior (1-2 yrs)'},
                {'value': 'mid',     'label': 'Mid (3-5 yrs)'},
                {'value': 'senior',  'label': 'Senior (5+ yrs)'},
            ],
        })
