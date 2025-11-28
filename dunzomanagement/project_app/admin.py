from django.contrib import admin
from .models import Project, ProjectMembership, Tag

# Basic registration
admin.site.register(Project)
admin.site.register(ProjectMembership)
admin.site.register(Tag)