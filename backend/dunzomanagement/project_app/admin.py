from django.contrib import admin
from .models import Project, KanbanColumn

# Basic registration
admin.site.register(Project)
admin.site.register(KanbanColumn)