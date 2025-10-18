from django.db import models
from task_app.models import Task
from project_app.models import Project

# Create your models here.
class CalendarEvent(models.Model):
    event_id = models.AutoField(primary_key=True)

    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    title = models.TextField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    type = (
        'Deadline',
        'Milestone',
        'Meeting'
    )