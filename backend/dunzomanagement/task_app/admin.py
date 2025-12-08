from django.contrib import admin
from .models import Task, Assignment, Comment

# Basic registration
admin.site.register(Task)
admin.site.register(Assignment)
admin.site.register(Comment)