from django.db import models
from user_app.models import User, Notification
from project_app.models import Project, Tag

# Create your models here.
class Task(models.Model):
    STATUS_CHOICES = [
        ('To Do', 'To Do'),
        ('In Progress', 'In Progress'),
        ('Done', 'Done'),
        ('Archived', 'Archived'),
    ]

    task_id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    users = models.ManyToManyField(User, through='Assignment', related_name='tasks')
    tags = models.ManyToManyField(Tag, blank=True)

    title = models.CharField(max_length=100)
    description = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='To Do')

    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-due_date']

    def __str__(self):
        return self.title

class Assignment(models.Model):
    ROLE_CHOICES = [
        ('Owner', 'Owner'),
        ('Contributor', 'Contributor'),
        ('Reviewer', 'Reviewer'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='assignments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments')

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'task')


class Comment(models.Model):
    comment_id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='replies',
        on_delete=models.CASCADE
    )

    content = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True, default=None)