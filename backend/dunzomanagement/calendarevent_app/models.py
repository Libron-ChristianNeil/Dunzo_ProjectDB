from django.core.exceptions import ValidationError
from django.db import models
from task_app.models import Task
from user_app.models import User
from project_app.models import Project

# Create your models here.
class CalendarEvent(models.Model):
    TYPE_CHOICES = [
        ('Deadline', 'Deadline'),
        ('Meeting', 'Meeting'),
        ('Event', 'Event'),
    ]
    event_id = models.AutoField(primary_key=True)

    # What generated the event?
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)

    # meeting participants
    users = models.ManyToManyField(User, related_name='calendar_events', blank=True)

    title = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Event')
    description = models.TextField(blank=True)

    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField()

    def clean(self):
        if not self.project and not self.task and not self.user:
            raise ValidationError("Event must be linked to a project, task, or user.")