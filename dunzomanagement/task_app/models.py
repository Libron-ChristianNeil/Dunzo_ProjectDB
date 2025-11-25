from django.db import models
from user_app.models import User, Notification
from project_app.models import Project
import datetime

# Create your models here.
class Task(models.Model):
    task_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    notification_id = models.ForeignKey(
        Notification,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    # Many-to-Many relationship to users through Assignment
    users = models.ManyToManyField(User, through='Assignment', related_name='tasks')

    title = models.CharField(max_length=100)
    description = models.TextField()
    status = (
        'To Do',
        'In Progress',
        'Done',
        'Blocked'
    )
    priority = (
        'Low',
        'Medium',
        'High'
    )

    due_date = models.DateField(default=datetime.date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Assignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    role = (
        'Owner',
        'Contributor',
        'Reviewer'
    )

    assigned_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    comment_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)