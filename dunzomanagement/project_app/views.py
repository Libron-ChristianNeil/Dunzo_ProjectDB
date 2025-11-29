from django.contrib.auth.decorators import login_required
from django.shortcuts import render

project = 'project_app/project_app.html'
details = 'project_app/project_details.html'

create_project = 'project_app/create_project.html'
edit_project = 'project_app/edit_project.html'
delete_project = 'project_app/delete_project.html'

manage_members = 'project_app/manage_members.html'

create_tag = 'project_app/create_tag.html'
delete_tag = 'project_app/delete_tag.html'

# @login_required
def get_projects(request):
    # List all projects the user is involved in
    return render(request, project)

