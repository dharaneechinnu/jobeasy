from django.urls import path
from .views import SavedJobListCreateView, SavedJobDeleteView, UpdateJobNotesView

urlpatterns = [
    path('', SavedJobListCreateView.as_view(), name='saved_jobs'),
    path('<int:pk>/', SavedJobDeleteView.as_view(), name='saved_job_delete'),
    path('<int:pk>/notes/', UpdateJobNotesView.as_view(), name='saved_job_notes'),
]
