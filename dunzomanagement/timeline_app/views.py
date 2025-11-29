from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import Http404
from django.views import View
from .models import TimelineEntry

entry = 'timeline_app/timeline_app.html'

# @login_required
def get_entries(request):
    user = request.user

    # Step 1: Get all projects the user is involved in
    user_projects = user.projects.all()  # because of Project.users ManyToMany

    # Step 2: Get timeline entries for those projects
    entries = TimelineEntry.objects.filter(project__in=user_projects).select_related('user', 'project')
    # Step 3: Return to template
    return render(request, entry, { "entries": entries })
