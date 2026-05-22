import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status


JSEARCH_URL = 'https://jsearch.p.rapidapi.com/search'

# Maps our experience labels to search keywords appended to query
EXPERIENCE_KEYWORDS = {
    'fresher': 'fresher entry level',
    'junior': 'junior 1-2 years experience',
    'mid': 'mid level 3-5 years experience',
    'senior': 'senior 5+ years experience',
}


def fetch_jobs(query, location='', employment_type='', date_posted='month',
               experience='', page=1, num_pages=1):
    """Call JSearch API and return raw results."""
    headers = {
        'X-RapidAPI-Key': settings.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    }

    # Append experience keywords to narrow results
    experience_kw = EXPERIENCE_KEYWORDS.get(experience, '')
    full_query = ' '.join(filter(None, [query, experience_kw, location]))

    params = {
        'query': full_query,
        'page': str(page),
        'num_pages': str(num_pages),
        'date_posted': date_posted,
    }
    if employment_type:
        params['employment_types'] = employment_type.upper()

    response = requests.get(JSEARCH_URL, headers=headers, params=params, timeout=15)
    response.raise_for_status()
    data = response.json()
    return data.get('data', []), data.get('status', '') == 'OK'


def format_job(job):
    """Extract and clean relevant fields from a JSearch job object."""
    return {
        'job_id': job.get('job_id', ''),
        'job_title': job.get('job_title', ''),
        'employer_name': job.get('employer_name', ''),
        'employer_logo': job.get('employer_logo'),
        'job_employment_type': job.get('job_employment_type', ''),
        'job_apply_link': job.get('job_apply_link', ''),
        'job_description': (job.get('job_description') or '')[:500],  # truncate for list view
        'job_city': job.get('job_city'),
        'job_country': job.get('job_country', ''),
        'job_posted_at': job.get('job_posted_at_datetime_utc'),
        'job_min_salary': job.get('job_min_salary'),
        'job_max_salary': job.get('job_max_salary'),
        'job_salary_currency': job.get('job_salary_currency'),
        'job_highlights': job.get('job_highlights', {}),
        'source_portal': 'JSearch',
    }


class JobSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query', '').strip()
        location = request.query_params.get('location', '').strip()
        employment_type = request.query_params.get('employment_type', '').strip()
        date_posted = request.query_params.get('date_posted', 'month')
        experience = request.query_params.get('experience', 'fresher').strip()
        page = int(request.query_params.get('page', 1))

        if not query:
            return Response(
                {'error': 'query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not settings.RAPIDAPI_KEY:
            return Response(
                {'error': 'RapidAPI key not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            raw_jobs, api_ok = fetch_jobs(
                query, location, employment_type,
                date_posted, experience, page
            )
        except requests.exceptions.Timeout:
            return Response(
                {'error': 'Job search timed out. Please try again.'},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Failed to fetch jobs: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        # Deduplicate by job_id
        seen = set()
        jobs = []
        for job in raw_jobs:
            job_id = job.get('job_id')
            if job_id and job_id not in seen:
                seen.add(job_id)
                jobs.append(format_job(job))

        return Response({
            'count': len(jobs),
            'page': page,
            'has_next_page': len(jobs) >= 10,
            'results': jobs,
        })


class JobFiltersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Return available filter options for the frontend."""
        return Response({
            'employment_types': [
                {'value': 'fulltime', 'label': 'Full Time'},
                {'value': 'parttime', 'label': 'Part Time'},
                {'value': 'intern', 'label': 'Internship'},
                {'value': 'contractor', 'label': 'Contract'},
            ],
            'date_posted_options': [
                {'value': 'today', 'label': 'Today'},
                {'value': 'week', 'label': 'This Week'},
                {'value': 'month', 'label': 'This Month'},
                {'value': 'all', 'label': 'All Time'},
            ],
            'experience_levels': [
                {'value': 'fresher', 'label': 'Fresher'},
                {'value': 'junior', 'label': 'Junior (1-2 yrs)'},
                {'value': 'mid', 'label': 'Mid (3-5 yrs)'},
                {'value': 'senior', 'label': 'Senior (5+ yrs)'},
            ],
        })
