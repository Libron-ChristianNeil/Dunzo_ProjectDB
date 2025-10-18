from django.db import models

# imported classes
from project_app.models import Project
from user_app.models import User

# Create your models here.
class TimelineEntry(models.Model):
    timeline_id = models.IntegerField(primary_key=True, null = False)
    project_id = models.ManyToManyField(Project)
    user_id = models.ManyToManyField(User)

