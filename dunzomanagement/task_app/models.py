from django.db import models
from user_app.models import User, Notification
from project_app.models import Project
import datetime

# Create your models here.
class Task(models.Model):
    STATUS_CHOICES = [
        ('To Do', 'To Do'),
        ('In Progress', 'In Progress'),
        ('Done', 'Done'),
        ('Blocked', 'Blocked'),
    ]

    # PRIORITY_CHOICES = [
    #     ('Low', 'Low'),
    #     ('Medium', 'Medium'),
    #     ('High', 'High'),
    # ]

    task_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    notification_id = models.ForeignKey(Notification, on_delete=models.SET_NULL, null=True, blank=True)
    # Many-to-Many relationship to users through Assignment
    users = models.ManyToManyField(User, through='Assignment', related_name='tasks')

    title = models.CharField(max_length=100)
    description = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='To Do')
    # priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')

    due_date = models.DateField(default=datetime.date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Assignment(models.Model):
    ROLE_CHOICES = [
        ('Owner', 'Owner'),
        ('Contributor', 'Contributor'),
        ('Reviewer', 'Reviewer'),
    ]

    assignment_id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    assigned_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    comment_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)