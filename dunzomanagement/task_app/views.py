from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from .models import Task, Assignment, Comment
from project_app.models import Project
from user_app.models import User

task = 'task_app/task_app.html'
details = 'task_app/task_details.html'

create = 'task_app/create_task.html'
edit_task = 'task_app/edit_task.html'
delete_task = 'task_app/delete_task.html'

manage_users = 'task_app/manage_users.html'
add_self = 'task_app/assign_self.html'

comment = 'task_app/add_comment.html'
edit_comment = 'task_app/edit_comment.html'
delete_comment = 'task_app/delete_comment.html'

manage_tags = 'task_app/manage_tags.html'

# @login_required
def get_tasks(request):
    tasks = Task.objects.filter(users=request.user.id)

    return render(request, task, {"tasks": tasks})

# @login_required
def get_tasks_by_project(request, project_id):
    tasks = Task.objects.filter(project_id=project_id)

    return render(request, task, {"tasks": tasks})

# @login_required
def get_tasks_by_status(request, status):
    tasks = Task.objects.filter(status=status)

    return render(request, task, {"tasks": tasks})

# @login_required
def get_details(request, task_id):
    task = get_object_or_404(Task, pk=task_id)
    assignments = Assignment.objects.filter(task=task)
    comments = Comment.objects.filter(task_id=task)

    return render(request, details, {
        "task": task,
        "assignments": assignments,
        "comments": comments,
    })



