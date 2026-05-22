from django.db import models
from django.conf import settings


class SavedJob(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_jobs'
    )
    job_id = models.CharField(max_length=255)
    job_title = models.CharField(max_length=500)
    company_name = models.CharField(max_length=500)
    location = models.CharField(max_length=500, blank=True)
    job_url = models.URLField(max_length=2000)
    source_portal = models.CharField(max_length=100, default='JSearch')
    salary = models.CharField(max_length=255, blank=True)
    job_type = models.CharField(max_length=100, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-saved_at']
        unique_together = ['user', 'job_id']

    def __str__(self):
        return f'{self.job_title} at {self.company_name} — {self.user.email}'
