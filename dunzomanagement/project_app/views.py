from django.contrib.auth.decorators import login_required
from django.shortcuts import render

project = 'project_app/project_app.html'

# @login_required
def get_projects(request):
    # List all projects the user is involved in
    return render(request, project)

