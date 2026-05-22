from django.urls import path
from .views import JobSearchView, JobFiltersView

urlpatterns = [
    path('search/', JobSearchView.as_view(), name='job_search'),
    path('filters/', JobFiltersView.as_view(), name='job_filters'),
]
