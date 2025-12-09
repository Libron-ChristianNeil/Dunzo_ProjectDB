from django.db import models
from project_app.models import Project
from user_app.models import User
from django.utils import timezone

class TimelineEntry(models.Model):
    timeline_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        default=1
    )
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        default=1
    )
    action = models.CharField(max_length=255, default=1)
    details = models.TextField(default="null")
    created_at = models.DateTimeField(default=timezone.now)

