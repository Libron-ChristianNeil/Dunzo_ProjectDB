from django.db import models
from user_app.models import User

class Project(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Archived', 'Archived'),
        ('Complete', 'Complete'),
    ]
    project_id = models.AutoField(primary_key=True)
    users = models.ManyToManyField(User,through="ProjectMembership",related_name="projects")

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title

class ProjectMembership(models.Model):
    ROLE_CHOICES = [
        ('Leader', 'Leader'),
        ('Manager', 'Manager'),
        ('Member', 'Member'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='memberships')

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'project')

class Tag(models.Model):
    tag_id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    name = models.CharField(max_length=50)
    hex_color = models.CharField(max_length=20, default="#000000")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


