from django.db import models
from user_app.models import User, Notification
from project_app.models import Project
import datetime

# Create your models here.
class Task(models.Model):
    task_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        default=1
    )

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

    # Many-to-Many relationship to users through Assignment
    user_id = models.ManyToManyField(User, through='Assignment')

    # Notification as ForeignKey
    notification_id = models.ForeignKey(
        Notification,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.title

class Assignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        default=1
    )

    role = (
        'Owner',
        'Contributor',
        'Reviewer'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    comment_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        default=1
    )

    content = models.TextField()
    create_time = models.DateTimeField(auto_now_add=True)