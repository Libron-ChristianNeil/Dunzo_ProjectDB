from django.db import models
from user_app.models import User


class Project(models.Model):
    project_id = models.AutoField(primary_key=True)
    project_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    status = (
        'Active',
        'Archived',
        'Complete'
    )
    last_login = models.DateTimeField(blank=True, null=True)

    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")


class KanbanColumn(models.Model):
    column_id = models.AutoField(primary_key=True)
    name = (
        'To do',
        'In Progress',
        'Done'
    )
    order_index = models.PositiveIntegerField(default=0)

    project_id = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="columns")


