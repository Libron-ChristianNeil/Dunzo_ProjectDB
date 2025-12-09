from django.db import models
from project_app.models import Project
from user_app.models import User

class TimelineEntry(models.Model):
    timeline_id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project,on_delete=models.CASCADE)

    action = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Order by creation date, most recent first

    def __str__(self):
        return self.action