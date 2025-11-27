from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.views import View
from .models import Task, Assignment, Comment
from project_app.models import Project
from user_app.models import User


# Create your views here.
class TaskAppView(View):
    task_app = 'task_app/task_app.html'
    create_task = 'task_app/create_task.html'
    task_detail = 'task_app/task_detail.html'
    edit_task = 'task_app/edit_task.html'

    def get(self, request):
        return render(request, self.task_app)

    # CREATE:
    # Allows a MANAGER to create a new task under a specific project.
    @login_required
    def create_task(request, project_id):
        project = get_object_or_404(Project, pk=project_id)

        if request.user.role != "Manager":
            return HttpResponseForbidden("Only managers can create tasks.")

        if request.method == "POST":
            task = Task.objects.create(
                project_id=project,
                title=request.POST["title"],
                description=request.POST["description"],
                priority=request.POST["priority"],
                due_date=request.POST["due_date"],
            )

            user_ids = request.POST.getlist("user_ids")
            roles = request.POST.getlist("roles")

            for user_id, role in zip(user_ids, roles):
                Assignment.objects.create(
                    task=task,
                    user_id=user_id,
                    role=role
                )

            return redirect("task_detail", task_id=task.task_id)

        return render(request, 'task_app/create_task.html', {"project": project})

    # CREATE:
    # Allows any member of the project to add a comment to the task.
    @login_required
    def add_comment(request, task_id):
        task = get_object_or_404(Task, pk=task_id)

        if not task.project_id.users.filter(id=request.user.id).exists():
            return HttpResponseForbidden("You are not part of this project.")

        if request.method == "POST":
            Comment.objects.create(
                task_id=task,
                user_id=request.user,
                content=request.POST["content"]
            )
            return redirect("task_detail", task_id=task_id)

        return render(request, "tasks/task_detail.html", {"task": task})

    # READ:
    # Retrieves all tasks under a specific project and displays them.
    @login_required
    def list_task_app_by_project(request, project_id):
        tasks = Task.objects.filter(project_id=project_id).order_by("due_date")

        return render(request, "task_app/task_app.html", {"tasks": tasks})

    # READ:
    # Retrieves all tasks
    @login_required
    def list_tasks(request):
        tasks = Task.objects.order_by("due_date")

        return render(request, "task_app/task_app.html", {"tasks": tasks})

    # READ:
    # Retrieves all tasks with a specific status
    @login_required
    def list_tasks_by_status(request, status):
        tasks = Task.objects.filter(status=status).order_by("due_date")

        return render(request, "task_app/task_app.html", {"tasks": tasks})

    # READ:
    # Retrieves ONE task along with its comments and assigned users.
    @login_required
    def task_detail(request, task_id):
        task = get_object_or_404(Task, pk=task_id)
        assignments = Assignment.objects.filter(task=task)
        comments = Comment.objects.filter(task_id=task)

        return render(request, "task_app/task_detail.html", {
            "task": task,
            "assignments": assignments,
            "comments": comments,
        })

    # UPDATE:
    # Allows a MANAGER to assign a user to a task with a specific role.
    @login_required
    def assign_user_to_task(request, task_id):
        task = get_object_or_404(Task, task_id=task_id)

        if request.user.role != "Manager":
            return HttpResponseForbidden("Only managers can assign users.")

        if request.method == "POST":
            user = request.POST.get("user_id")
            role = request.POST.get("role")

            Assignment.objects.create(
                task=task,
                user=user,
                role=role
            )

            return redirect("task_detail", task_id=task_id)

        return render(request, "task_app/edit_task.html", {"task": task})

    # UPDATE:
    # Allows user to edit their own comments
    # @login_required
    # def edit_comment(request, comment_id):
    #     comment = get_object_or_404(Comment, pk=comment_id)
    #
    #     if request.user.user_id != comment.user_id:
    #         return HttpResponseForbidden("You can only edit your own comments.")
    #
    #     if request.method == "POST":
    #         comment.content = request.POST["content"]
    #
    #         return redirect("task_detail", task_id=comment_id)
    #
    #     return render(request, "task_app/edit_task.html", {"task": task})

    # UPDATE:
    # Allows a project member to assign THEMSELVES to a task
    @login_required
    def self_assign_task(request, task_id):
        task = get_object_or_404(Task, pk=task_id)

        if not task.project_id.users.filter(id=request.user.id).exists():
            return HttpResponseForbidden("You are not part of this project.")

        if task.status == "Done":
            return HttpResponseForbidden("This task is already completed.")


        Assignment.objects.get_or_create(
            task=task,
            user=request.user
        )

        return redirect("task_detail", task_id=task_id)

    # UPDATE:
    # Allows the OWNER of the task to update its status.
    @login_required
    def update_task_status(request, task_id):
        task = get_object_or_404(Task, pk=task_id)

        is_owner = Assignment.objects.filter(
            task=task, user=request.user, role="Owner"
        ).exists()

        if not is_owner:
            return HttpResponseForbidden("Only the task owner can update the status.")

        if request.method == "POST":
            task.status = request.POST["status"]
            task.save()
            return redirect("task_detail", task_id=task_id)

        return render(request, "task_app/edit_task.html", {"task": task})

    # DELETE:
    # Allows a MANAGER to remove a user from a task assignment.
    @login_required
    def remove_assignment(request, assignment_id):
        assignment = get_object_or_404(Assignment, pk=assignment_id)

        if request.user.role != "Manager":
            return HttpResponseForbidden("Only managers can remove assignments.")

        assignment.delete()
        return redirect("task_detail", task_id=assignment.task.task_id)

    # DELETE:
    # Allows a user to remove THEIR OWN assignment from a task.
    @login_required
    def self_unassign_task(request, task_id):
        task = get_object_or_404(Task, pk=task_id)

        # Get the assignment belonging to the logged-in user
        assignment = Assignment.objects.filter(task=task, user=request.user).first()

        assignment.delete()

        return redirect("task_detail", task_id=task_id)

    # UPDATE:
    # Allows users to delete comments
    # @login_required
    # def edit_comment(request, comment_id):
    #     comment = get_object_or_404(Comment, pk=comment_id)
    #
    #     if request.user.user_id != comment.user_id:
    #         return HttpResponseForbidden("You can only edit your own comments.")
    #
    #     if request.method == "POST":
    #         comment.content = request.POST["content"]
    #
    #         return redirect("task_detail", task_id=comment_id)
    #
    #     return render(request, "task_app/edit_task.html", {"task": task})


