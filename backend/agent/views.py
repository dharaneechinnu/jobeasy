import re
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from jobs.views import fetch_jobs, format_job


# Sorted longest-first so multi-word skills match before single words
TECH_SKILLS = sorted([
    'software engineer', 'software developer', 'web developer', 'mobile developer',
    'frontend developer', 'backend developer', 'fullstack developer', 'full stack developer',
    'data scientist', 'data analyst', 'data engineer', 'machine learning engineer',
    'ml engineer', 'ai engineer', 'deep learning', 'natural language processing',
    'devops engineer', 'cloud engineer', 'platform engineer', 'site reliability engineer',
    'security engineer', 'cybersecurity analyst', 'network engineer',
    'qa engineer', 'test engineer', 'automation testing',
    'product manager', 'project manager', 'scrum master',
    'ui/ux designer', 'ui designer', 'ux designer', 'graphic designer',
    'content writer', 'digital marketing', 'seo specialist',
    'python', 'django', 'flask', 'fastapi',
    'javascript', 'typescript', 'react', 'react native', 'vue', 'angular',
    'node.js', 'nodejs', 'next.js', 'express',
    'java', 'spring boot', 'kotlin', 'android', 'ios', 'swift',
    'flutter', 'dart', 'golang', 'rust', 'ruby', 'rails', 'php', 'laravel',
    'c++', 'c#', '.net', 'wordpress',
    'aws', 'gcp', 'azure', 'kubernetes', 'docker', 'terraform',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sql',
    'blockchain', 'web3', 'solidity',
    'developer', 'engineer', 'designer', 'analyst', 'manager',
], key=len, reverse=True)

EXPERIENCE_PATTERNS = {
    'senior':  [r'\bsenior\b', r'\b5\+?\s*years?\b', r'\blead\b', r'\bprincipal\b', r'\bstaff\b'],
    'mid':     [r'\bmid[\s-]?level\b', r'\bintermediate\b', r'\b[345][\s-]?years?\b', r'\b3-5\s*years?\b'],
    'junior':  [r'\bjunior\b', r'\b[12][\s-]?years?\b', r'\b1-2\s*years?\b'],
    'fresher': [r'\bfresher\b', r'\bentry[\s-]?level\b', r'\bno experience\b',
                r'\bjust graduated\b', r'\bfresh graduate\b', r'\b0\s*years?\b'],
}

EMPLOYMENT_PATTERNS = {
    'intern':     [r'\binternship\b', r'\bintern\b', r'\btrainee\b', r'\bapprentice\b'],
    'parttime':   [r'\bpart[\s-]?time\b'],
    'contractor': [r'\bcontract\b', r'\bfreelance\b', r'\bconsultant\b'],
    'fulltime':   [r'\bfull[\s-]?time\b', r'\bpermanent\b'],
}

_LOCATION_RE = re.compile(
    r'\b(?:in|at|from|near|around)\s+([A-Za-z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'
)
_NON_LOCATIONS = {
    'a', 'an', 'the', 'my', 'your', 'our', 'this', 'that', 'remote',
    'office', 'home', 'india', 'usa', 'uk', 'canada', 'australia',
}

_STOPWORDS = {
    'i', 'want', 'need', 'find', 'search', 'looking', 'for', 'a', 'an', 'the',
    'job', 'jobs', 'work', 'position', 'role', 'me', 'please', 'can', 'you',
    'help', 'get', 'show', 'give', 'in', 'at', 'with', 'my', 'year', 'years',
    'experience', 'level', 'fresher', 'senior', 'junior', 'mid', 'full',
    'time', 'part', 'internship', 'contract', 'some', 'good', 'any',
}


def _extract_params(message):
    msg_lower = message.lower()

    # Query — match tech skills (longest first to avoid partial overlaps)
    found = []
    remaining = msg_lower
    for skill in TECH_SKILLS:
        if skill in remaining:
            found.append(skill)
            remaining = remaining.replace(skill, ' ', 1)
            if len(found) >= 3:
                break

    if not found:
        words = [w for w in re.findall(r'\b[a-z]+\b', msg_lower)
                 if w not in _STOPWORDS and len(w) > 2]
        found = words[:3]

    query = ' '.join(found)

    # Experience — check most specific first so "senior" wins over "fresher"
    experience = 'fresher'
    for level in ('senior', 'mid', 'junior', 'fresher'):
        for pat in EXPERIENCE_PATTERNS[level]:
            if re.search(pat, message, re.IGNORECASE):
                experience = level
                break
        else:
            continue
        break

    # Employment type
    employment_type = ''
    for etype in ('intern', 'parttime', 'contractor', 'fulltime'):
        for pat in EMPLOYMENT_PATTERNS[etype]:
            if re.search(pat, message, re.IGNORECASE):
                employment_type = etype
                break
        else:
            continue
        break

    # Location
    location = ''
    for match in _LOCATION_RE.finditer(message):
        candidate = match.group(1).strip()
        if candidate.lower() not in _NON_LOCATIONS and len(candidate) > 2:
            location = candidate
            break

    return query, location, experience, employment_type


def _build_reply(query, location, experience, employment_type):
    parts = [f'"{query}"']
    if location:
        parts.append(f'in {location}')
    if experience and experience != 'fresher':
        parts.append(f'({experience} level)')
    if employment_type:
        parts.append(f'[{employment_type}]')
    return f"Searching for {' '.join(parts)} jobs..."


class AgentChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response(
                {'error': 'message is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        query, location, experience, employment_type = _extract_params(user_message)

        if not query:
            return Response({
                'reply': (
                    "I couldn't figure out what kind of job you're looking for. "
                    "Try something like 'Python developer jobs in Bangalore' "
                    "or 'React frontend internship'."
                ),
                'jobs': [],
            })

        reply_prefix = _build_reply(query, location, experience, employment_type)

        try:
            raw_jobs, _ = fetch_jobs(query, location, employment_type, 'month', experience)
        except requests.exceptions.RequestException as e:
            return Response({
                'reply': reply_prefix,
                'jobs': [],
                'warning': f'Could not fetch jobs: {e}',
            })

        seen = set()
        jobs = []
        for job in raw_jobs:
            jid = job.get('job_id')
            if jid and jid not in seen:
                seen.add(jid)
                jobs.append(format_job(job))

        if jobs:
            reply = f"{reply_prefix} Found {len(jobs)} matching job(s)!"
        else:
            reply = (
                f"{reply_prefix} No exact matches found — try broader keywords "
                "or remove the location filter."
            )

        return Response({
            'reply': reply,
            'jobs': jobs,
            'search_params': {
                'query': query,
                'location': location,
                'employment_type': employment_type,
            },
        })
