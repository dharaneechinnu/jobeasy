from rest_framework import serializers
from .models import SavedJob


class SavedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedJob
        fields = [
            'id', 'job_id', 'job_title', 'company_name', 'location',
            'job_url', 'source_portal', 'salary', 'job_type',
            'saved_at', 'notes'
        ]
        read_only_fields = ['id', 'saved_at']


class SavedJobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedJob
        fields = [
            'job_id', 'job_title', 'company_name', 'location',
            'job_url', 'source_portal', 'salary', 'job_type', 'notes'
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Use update_or_create to avoid duplicate errors
        obj, _ = SavedJob.objects.get_or_create(
            user=validated_data['user'],
            job_id=validated_data['job_id'],
            defaults=validated_data,
        )
        return obj


class UpdateNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedJob
        fields = ['notes']
