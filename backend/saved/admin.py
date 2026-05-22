from django.contrib import admin
from .models import SavedJob


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ['job_title', 'company_name', 'user', 'source_portal', 'saved_at']
    list_filter = ['source_portal', 'job_type']
    search_fields = ['job_title', 'company_name', 'user__email']
    ordering = ['-saved_at']
