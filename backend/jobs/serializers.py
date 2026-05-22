from rest_framework import serializers


class JobSerializer(serializers.Serializer):
    """Serializes a single job from JSearch API response."""
    job_id = serializers.CharField(source='job_id', default='')
    job_title = serializers.CharField(source='job_title', default='')
    employer_name = serializers.CharField(source='employer_name', default='')
    employer_logo = serializers.URLField(source='employer_logo', allow_null=True, default=None)
    job_employment_type = serializers.CharField(source='job_employment_type', default='')
    job_apply_link = serializers.URLField(source='job_apply_link', default='')
    job_description = serializers.CharField(source='job_description', default='')
    job_city = serializers.CharField(source='job_job_city', allow_null=True, default=None)
    job_country = serializers.CharField(source='job_country', default='')
    job_posted_at = serializers.CharField(source='job_posted_at_datetime_utc', allow_null=True, default=None)
    job_min_salary = serializers.FloatField(source='job_min_salary', allow_null=True, default=None)
    job_max_salary = serializers.FloatField(source='job_max_salary', allow_null=True, default=None)
    job_salary_currency = serializers.CharField(source='job_salary_currency', allow_null=True, default=None)
    job_required_experience = serializers.DictField(source='job_required_experience', default=dict)
    job_highlights = serializers.DictField(source='job_highlights', default=dict)
    source_portal = serializers.CharField(default='JSearch')
