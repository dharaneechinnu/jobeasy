from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    EXPERIENCE_CHOICES = [
        ('fresher', 'Fresher'),
        ('junior', 'Junior (1-2 years)'),
        ('mid', 'Mid (3-5 years)'),
        ('senior', 'Senior (5+ years)'),
    ]

    # Remove username — use email as login
    username = None
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    skills = models.TextField(
        blank=True,
        help_text='Comma-separated skills, e.g. Python, React, Django'
    )
    experience_level = models.CharField(
        max_length=20,
        choices=EXPERIENCE_CHOICES,
        default='fresher'
    )
    location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    @property
    def skills_list(self):
        return [s.strip() for s in self.skills.split(',') if s.strip()]
