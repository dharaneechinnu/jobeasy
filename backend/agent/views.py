import json
import requests
import anthropic
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from jobs.views import fetch_jobs, format_job


SYSTEM_PROMPT = """You are JobEasy AI, a friendly job search assistant for freshers and job seekers.

When a user sends a message, extract job search parameters and return ONLY a valid JSON object with these keys:
{
  "query": "job title or skills to search (required)",
  "location": "city or country, empty string if not mentioned",
  "employment_type": "fulltime|parttime|intern|contractor, empty string if not mentioned",
  "experience": "fresher|junior|mid|senior, default fresher",
  "date_posted": "today|week|month|all, default month",
  "friendly_message": "A warm, encouraging 1-2 sentence response to the user"
}

Default experience to fresher unless the user explicitly mentions years of experience or a senior role.
The friendly_message should acknowledge what the user asked and say you're searching for them.
Return ONLY the JSON object, no other text."""


class AgentChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response(
                {'error': 'message is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not settings.ANTHROPIC_API_KEY:
            return Response(
                {'error': 'AI service not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Step 1: Ask Claude to extract search parameters
        try:
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message = client.messages.create(
                model='claude-sonnet-4-6',
                max_tokens=512,
                system=SYSTEM_PROMPT,
                messages=[{'role': 'user', 'content': user_message}],
            )
            raw_response = message.content[0].text.strip()
        except anthropic.APIError as e:
            return Response(
                {'error': f'AI service error: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        # Step 2: Parse Claude's JSON response
        try:
            # Strip markdown code fences if present
            if raw_response.startswith('```'):
                raw_response = raw_response.split('\n', 1)[1].rsplit('```', 1)[0]
            params = json.loads(raw_response)
        except (json.JSONDecodeError, IndexError):
            return Response(
                {'error': 'AI could not parse your request. Please try rephrasing.'},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        query = params.get('query', '')
        location = params.get('location', '')
        employment_type = params.get('employment_type', '')
        date_posted = params.get('date_posted', 'month')
        friendly_message = params.get('friendly_message', 'Searching for jobs...')

        if not query:
            return Response({
                'reply': "I couldn't understand what kind of job you're looking for. Please mention a role or skill, like 'Python developer jobs in Bangalore'.",
                'jobs': [],
            })

        # Step 3: Fetch jobs from JSearch
        if not settings.RAPIDAPI_KEY:
            return Response({
                'reply': friendly_message,
                'jobs': [],
                'warning': 'Job search API not configured.',
            })

        experience = params.get('experience', 'fresher')
        try:
            raw_jobs, _ = fetch_jobs(query, location, employment_type, date_posted, experience)
        except requests.exceptions.RequestException as e:
            return Response({
                'reply': friendly_message,
                'jobs': [],
                'warning': f'Could not fetch jobs: {str(e)}',
            })

        # Deduplicate and format
        seen = set()
        jobs = []
        for job in raw_jobs:
            job_id = job.get('job_id')
            if job_id and job_id not in seen:
                seen.add(job_id)
                jobs.append(format_job(job))

        # Build final reply
        if jobs:
            reply = f"{friendly_message} I found {len(jobs)} job(s) matching your search."
        else:
            reply = f"{friendly_message} Unfortunately I couldn't find any jobs matching that criteria. Try broadening your search."

        return Response({
            'reply': reply,
            'jobs': jobs,
            'search_params': {
                'query': query,
                'location': location,
                'employment_type': employment_type,
            },
        })
